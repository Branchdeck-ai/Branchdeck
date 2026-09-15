import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const GITHUB_APP_ID = process.env.GITHUB_APP_ID || '4859789';

function parsePrivateKeyObject(raw: string): { keyObject: crypto.KeyObject | null; debug: string } {
  if (!raw || typeof raw !== 'string') {
    return { keyObject: null, debug: 'Raw key is empty or invalid' };
  }

  const errors: string[] = [];
  let keyStr = raw.trim();

  // Strip wrapping quotes
  if ((keyStr.startsWith('"') && keyStr.endsWith('"')) || (keyStr.startsWith("'") && keyStr.endsWith("'"))) {
    keyStr = keyStr.slice(1, -1).trim();
  }

  // Strategy 1: As-is
  try {
    const k = crypto.createPrivateKey(keyStr);
    return { keyObject: k, debug: 'Strategy 1 (as-is)' };
  } catch (e: any) {
    errors.push(`Strategy 1: ${e.message}`);
  }

  // Strategy 2: Unescape \n and \r
  const unescaped = keyStr.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\r/g, '').trim();
  try {
    const k = crypto.createPrivateKey(unescaped);
    return { keyObject: k, debug: 'Strategy 2 (unescaped \\n)' };
  } catch (e: any) {
    errors.push(`Strategy 2: ${e.message}`);
  }

  // Strategy 3: Base64 decode
  if (!keyStr.includes('-----BEGIN')) {
    try {
      const cleanB64 = keyStr.replace(/[\s\r\n]+/g, '');
      const decoded = Buffer.from(cleanB64, 'base64').toString('utf8').trim();
      const decodedUnescaped = decoded.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\r/g, '').trim();
      const k = crypto.createPrivateKey(decodedUnescaped);
      return { keyObject: k, debug: 'Strategy 3 (Base64 decode)' };
    } catch (e: any) {
      errors.push(`Strategy 3: ${e.message}`);
    }
  }

  // Strategy 4: Full PEM Re-formatting
  const headerMatch = unescaped.match(/(-----BEGIN (?:[A-Z0-9_-]+ )?PRIVATE KEY-----)/i);
  const footerMatch = unescaped.match(/(-----END (?:[A-Z0-9_-]+ )?PRIVATE KEY-----)/i);

  if (headerMatch && footerMatch) {
    const header = headerMatch[1].toUpperCase();
    const footer = footerMatch[1].toUpperCase();
    const headerIdx = unescaped.search(new RegExp(headerMatch[0], 'i'));
    const footerIdx = unescaped.search(new RegExp(footerMatch[0], 'i'));

    if (headerIdx !== -1 && footerIdx !== -1 && footerIdx > headerIdx) {
      const rawBody = unescaped.slice(headerIdx + headerMatch[0].length, footerIdx);
      const cleanBody = rawBody.replace(/[^A-Za-z0-9+/=]/g, '');
      const chunkedBody = cleanBody.match(/.{1,64}/g)?.join('\n') || cleanBody;
      const pemFormatted = `${header}\n${chunkedBody}\n${footer}\n`;

      try {
        const k = crypto.createPrivateKey(pemFormatted);
        return { keyObject: k, debug: 'Strategy 4 (PEM Re-formatted)' };
      } catch (e: any) {
        errors.push(`Strategy 4: ${e.message}`);
      }

      try {
        const derBuffer = Buffer.from(cleanBody, 'base64');
        const k = crypto.createPrivateKey({ key: derBuffer, format: 'der', type: 'pkcs1' });
        return { keyObject: k, debug: 'Strategy 5 (DER PKCS#1)' };
      } catch (e: any) {
        errors.push(`Strategy 5: ${e.message}`);
      }

      try {
        const derBuffer = Buffer.from(cleanBody, 'base64');
        const k = crypto.createPrivateKey({ key: derBuffer, format: 'der', type: 'pkcs8' });
        return { keyObject: k, debug: 'Strategy 6 (DER PKCS#8)' };
      } catch (e: any) {
        errors.push(`Strategy 6: ${e.message}`);
      }
    }
  }

  // Strategy 7 & 8: Base64 payload wrapped in headers
  const pureB64 = keyStr.replace(/[^A-Za-z0-9+/=]/g, '');
  if (pureB64.length > 100) {
    const chunked = pureB64.match(/.{1,64}/g)?.join('\n') || pureB64;

    try {
      const k = crypto.createPrivateKey(`-----BEGIN RSA PRIVATE KEY-----\n${chunked}\n-----END RSA PRIVATE KEY-----\n`);
      return { keyObject: k, debug: 'Strategy 7 (Wrapped PKCS#1)' };
    } catch (e: any) {
      errors.push(`Strategy 7: ${e.message}`);
    }

    try {
      const k = crypto.createPrivateKey(`-----BEGIN PRIVATE KEY-----\n${chunked}\n-----END PRIVATE KEY-----\n`);
      return { keyObject: k, debug: 'Strategy 8 (Wrapped PKCS#8)' };
    } catch (e: any) {
      errors.push(`Strategy 8: ${e.message}`);
    }
  }

  return { keyObject: null, debug: `Key parsing failed (${errors.join(' | ')})` };
}

function loadPrivateKeyObject(): { keyObject: crypto.KeyObject | null; debug: string } {
  // 1. Production / Serverless Deployment: Check explicit env vars FIRST (GITHUB_APP_PRIVATE_KEY or GITHUB_APP_PRIVATE_KEY_B64)
  const b64Key = process.env.GITHUB_APP_PRIVATE_KEY_B64;
  if (b64Key) {
    const { keyObject, debug } = parsePrivateKeyObject(b64Key);
    if (keyObject) {
      return { keyObject, debug: `loaded from GITHUB_APP_PRIVATE_KEY_B64 env var -> ${debug}` };
    }
  }

  const rawKey = process.env.GITHUB_APP_PRIVATE_KEY;
  if (rawKey) {
    const { keyObject, debug } = parsePrivateKeyObject(rawKey);
    if (keyObject) {
      return { keyObject, debug: `loaded from GITHUB_APP_PRIVATE_KEY env var -> ${debug}` };
    }
  }

  // 2. Local Development: Read key file from disk via GITHUB_APP_PRIVATE_KEY_PATH or local candidate paths
  const keyPathEnv = process.env.GITHUB_APP_PRIVATE_KEY_PATH;
  const cwd = process.cwd();
  const candidates = [
    keyPathEnv && path.isAbsolute(keyPathEnv) ? keyPathEnv : null,
    keyPathEnv ? path.resolve(cwd, '..', keyPathEnv) : null,
    keyPathEnv ? path.resolve(cwd, keyPathEnv) : null,
    path.resolve(cwd, '..', 'backend', 'secrets', 'github-app-key.pem'),
    path.resolve(cwd, 'backend', 'secrets', 'github-app-key.pem'),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        const content = fs.readFileSync(candidate, 'utf8');
        const { keyObject, debug } = parsePrivateKeyObject(content);
        if (keyObject) {
          return { keyObject, debug: `loaded from file (${candidate}) -> ${debug}` };
        }
      }
    } catch { /* keep trying */ }
  }

  return {
    keyObject: null,
    debug: `No valid private key found. Checked serverless env vars (GITHUB_APP_PRIVATE_KEY / GITHUB_APP_PRIVATE_KEY_B64) and local file candidates: ${candidates.join(', ')}`,
  };
}

function generateAppJWT(): { jwt: string | null; debug: string } {
  const { keyObject, debug: keyDebug } = loadPrivateKeyObject();

  if (!keyObject) {
    return { jwt: null, debug: `No private key: ${keyDebug}` };
  }
  if (!GITHUB_APP_ID) {
    return { jwt: null, debug: 'GITHUB_APP_ID not set' };
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      iat: now - 60,
      exp: now + 540,
      iss: GITHUB_APP_ID,
    })).toString('base64url');

    const sigInput = `${header}.${payload}`;
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(sigInput);
    const sig = sign.sign(keyObject).toString('base64url');
    return { jwt: `${sigInput}.${sig}`, debug: `JWT generated OK. Key source: ${keyDebug}` };
  } catch (e: any) {
    return { jwt: null, debug: `JWT generation failed: ${e.message}. Key source: ${keyDebug}` };
  }
}

export async function POST(request: Request) {
  const debugLog: string[] = [];

  try {
    const authHeader = request.headers.get('Authorization');
    const body = await request.json().catch(() => ({}));
    const { organization_id, installation_id } = body;

    if (!organization_id) {
      return NextResponse.json({ success: false, error: 'organization_id is required' }, { status: 400 });
    }

    const { jwt: appJWT, debug: jwtDebug } = generateAppJWT();
    debugLog.push(jwtDebug);

    if (!appJWT) {
      return NextResponse.json({
        success: false,
        error: `Could not generate GitHub App JWT. ${jwtDebug}`,
        debug: debugLog,
        repos: [],
      }, { status: 422 });
    }

    let repos: Array<{ name: string; full_name: string; html_url: string; id: number }> = [];

    // Step 1: Find installation ID
    let installationId = installation_id;
    if (!installationId) {
      debugLog.push('No installation_id provided — fetching all installations...');
      const instRes = await fetch('https://api.github.com/app/installations', {
        headers: {
          Authorization: `Bearer ${appJWT}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Branchdeck-AIApp/1.0',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      const instBody = await instRes.text();
      debugLog.push(`Installations response: ${instRes.status} ${instBody.slice(0, 300)}`);

      if (instRes.ok) {
        const instData = JSON.parse(instBody);
        if (Array.isArray(instData) && instData.length > 0) {
          installationId = instData[0].id;
          debugLog.push(`Using first installation: ${installationId}`);
        } else {
          return NextResponse.json({
            success: false,
            error: 'GitHub App is not installed on any organization. Please install it first.',
            debug: debugLog,
            repos: [],
          }, { status: 422 });
        }
      } else {
        return NextResponse.json({
          success: false,
          error: `GitHub App JWT rejected (${instRes.status}). Check GITHUB_APP_ID and private key.`,
          debug: debugLog,
          repos: [],
        }, { status: 422 });
      }
    }

    // Step 2: Get installation access token
    debugLog.push(`Getting access token for installation ${installationId}...`);
    const tokenRes = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${appJWT}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Branchdeck-AIApp/1.0',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );
    const tokenBody = await tokenRes.text();
    debugLog.push(`Token response: ${tokenRes.status} ${tokenBody.slice(0, 200)}`);

    if (!tokenRes.ok) {
      return NextResponse.json({
        success: false,
        error: `Could not get installation access token (${tokenRes.status}). ${tokenBody.slice(0, 200)}`,
        debug: debugLog,
        repos: [],
      }, { status: 422 });
    }

    const tokenData = JSON.parse(tokenBody);
    const installToken = tokenData.token;

    // Step 3: List repos for this installation
    debugLog.push('Fetching repositories for installation...');
    const reposRes = await fetch('https://api.github.com/installation/repositories?per_page=100', {
      headers: {
        Authorization: `Bearer ${installToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'Branchdeck-AIApp/1.0',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    const reposBody = await reposRes.text();
    debugLog.push(`Repos response: ${reposRes.status} — found repos in body: ${reposBody.length}`);

    if (!reposRes.ok) {
      return NextResponse.json({
        success: false,
        error: `Could not list repositories (${reposRes.status}).`,
        debug: debugLog,
        repos: [],
      }, { status: 422 });
    }

    const reposData = JSON.parse(reposBody);
    repos = (reposData.repositories || []).map((r: any) => ({
      name: r.name,
      full_name: r.full_name,
      html_url: r.html_url,
      id: r.id,
    }));

    debugLog.push(`Found ${repos.length} repos.`);

    if (repos.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No repositories found for this GitHub App installation.',
        debug: debugLog,
        repos: [],
      }, { status: 422 });
    }

    // Step 4: Attempt to register repos in backend DB
    const registered: string[] = [];
    const failed: string[] = [];
    for (const repo of repos) {
      try {
        const backendRes = await fetch(`${BACKEND_URL}/api/dashboard/repos/connect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader || '',
          },
          body: JSON.stringify({
            organization_id,
            repo_url: repo.html_url,
            github_installation_id: installationId,
            repo_name: repo.name,
          }),
        });
        if (backendRes.ok) {
          registered.push(repo.name);
        } else {
          const bd = await backendRes.text().catch(() => '');
          debugLog.push(`Backend save failed for ${repo.name}: ${backendRes.status} ${bd.slice(0, 100)}`);
          failed.push(repo.name);
        }
      } catch (e: any) {
        debugLog.push(`Backend unreachable for ${repo.name}: ${e.message}`);
        failed.push(repo.name);
      }
    }

    return NextResponse.json({
      success: true,
      repos,
      registered,
      failed,
      message:
        registered.length > 0
          ? `Synced and saved ${registered.length} repo(s): ${registered.join(', ')}`
          : `Found ${repos.length} repo(s) from GitHub App (backend save skipped — start the backend to persist).`,
      debug: debugLog,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Sync failed', debug: debugLog },
      { status: 500 }
    );
  }
}
