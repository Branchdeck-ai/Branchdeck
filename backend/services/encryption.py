import os
import hashlib
import base64
from cryptography.fernet import Fernet

def _get_fernet() -> Fernet:
    master_key = (
        os.getenv("BRANCHDECK_ENCRYPTION_KEY")
        or os.getenv("ENCRYPTION_MASTER_KEY")
        or "branchdeck-default-master-key-2026-secret"
    )
    # Derive a 32-byte URL-safe base64 key from any master key string using SHA-256
    derived_bytes = hashlib.sha256(master_key.encode("utf-8")).digest()
    fernet_key = base64.urlsafe_b64encode(derived_bytes)
    return Fernet(fernet_key)

def encrypt_token(plaintext: str) -> str:
    """Encrypts raw token using Fernet symmetric encryption."""
    if not plaintext:
        return ""
    f = _get_fernet()
    return f.encrypt(plaintext.encode("utf-8")).decode("utf-8")

def decrypt_token(ciphertext: str) -> str:
    """Decrypts ciphertext back to raw token string."""
    if not ciphertext:
        return ""
    f = _get_fernet()
    return f.decrypt(ciphertext.encode("utf-8")).decode("utf-8")
