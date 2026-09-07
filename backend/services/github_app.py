import os
import time
import hmac
import hashlib
import jwt
import httpx
import logging
from typing import Optional
from fastapi import HTTPException

logger = logging.getLogger("branchdeck.github_app")

def get_github_app_private_key() -> Optional[str]:
    """Retrieve the RSA private key for the GitHub App."""
    key_path = os.getenv("GITHUB_APP_PRIVATE_KEY_PATH")
    if key_path:
        if not os.path.isabs(key_path):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            key_path = os.path.normpath(os.path.join(base_dir, key_path))
        if os.path.exists(key_path):
            with open(key_path, "r", encoding="utf-8") as f:
                return f.read()
    raw_key = os.getenv("GITHUB_APP_PRIVATE_KEY")
    if raw_key:
        return raw_key.replace("\\n", "\n")
    return None

def generate_app_jwt() -> str:
    """Generate a short-lived JWT signed with RS256 for GitHub App authentication."""
    app_id = os.getenv("GITHUB_APP_ID")
    if not app_id:
        raise HTTPException(status_code=500, detail="GITHUB_APP_ID environment variable is not configured")
    
    private_key = get_github_app_private_key()
    if not private_key:
        raise HTTPException(status_code=500, detail="GITHUB_APP_PRIVATE_KEY or GITHUB_APP_PRIVATE_KEY_PATH is not configured or missing")
    
    now = int(time.time())
    payload = {
        "iat": now - 60, # 60 seconds in the past for clock skew
        "exp": now + (10 * 60), # 10 minutes max expiration
        "iss": str(app_id)
    }
    
    try:
        token = jwt.encode(payload, private_key, algorithm="RS256")
        return token
    except Exception as e:
        logger.error(f"Failed to generate GitHub App JWT: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate GitHub App JWT: {str(e)}")

async def get_installation_access_token(installation_id: str) -> str:
    """Exchange a GitHub App JWT for a short-lived installation access token (valid ~1h)."""
    app_jwt = generate_app_jwt()
    url = f"https://api.github.com/app/installations/{installation_id}/access_tokens"
    headers = {
        "Authorization": f"Bearer {app_jwt}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "Branchdeck-AIApp/1.0"
    }
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(url, headers=headers)
        if resp.status_code not in (200, 201):
            err_msg = resp.text
            try:
                err_json = resp.json()
                err_msg = err_json.get("message", resp.text)
            except Exception:
                pass
            logger.error(f"Failed to mint installation access token for installation {installation_id}: HTTP {resp.status_code} {err_msg}")
            raise HTTPException(status_code=400, detail=f"GitHub App installation token minting failed: {err_msg} (HTTP {resp.status_code})")
        
        data = resp.json()
        token = data.get("token")
        if not token:
            raise HTTPException(status_code=400, detail="GitHub API response did not contain an access token")
        return token

def generate_signed_installation_state(org_id: str, secret: str) -> str:
    """Generate a signed state parameter containing organization_id to prevent CSRF/tampering."""
    now = int(time.time())
    payload = {
        "organization_id": org_id,
        "iat": now,
        "exp": now + 1800 # 30 minutes expiry
    }
    return jwt.encode(payload, secret, algorithm="HS256")

def verify_signed_installation_state(state_token: str, secret: str) -> str:
    """Verify and decode the signed installation state parameter, returning organization_id."""
    try:
        payload = jwt.decode(state_token, secret, algorithms=["HS256"], options={"require": ["exp"]})
        org_id = payload.get("organization_id")
        if not org_id:
            raise HTTPException(status_code=400, detail="Invalid state token: missing organization_id")
        return org_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Installation state token has expired. Please restart the installation flow.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid installation state parameter: {str(e)}")

def verify_webhook_signature(payload_bytes: bytes, signature_header: str, secret: str) -> bool:
    """Verify HMAC-SHA256 signature header (X-Hub-Signature-256) for incoming webhooks."""
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    expected_sig = signature_header.split("=", 1)[1]
    mac = hmac.new(secret.encode("utf-8"), msg=payload_bytes, digestmod=hashlib.sha256)
    computed_sig = mac.hexdigest()
    return hmac.compare_digest(computed_sig, expected_sig)
