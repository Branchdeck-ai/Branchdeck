import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const GITHUB_APP_ID = process.env.GITHUB_APP_ID || '4859789';

function loadPrivateKey(): { key: string | null; debug: string } {
  // Try env var first (raw PEM string)
  const rawKey = process.env.GITHUB_APP_PRIVATE_KEY;
  if (rawKey) {
    return { key: rawKey.replace(/\\n/g, '\n'), debug: 'loaded from GITHUB_APP_PRIVATE_KEY env var' };
  }

  // Try path-based key
  const keyPathEnv = process.env.GITHUB_APP_PRIVATE_KEY_PATH;
  if (!keyPathEnv) {
    return { key: null, debug: 'GITHUB_APP_PRIVATE_KEY_PATH not set' };
  }

  // Resolve: env value is relative to project root (one level above webapp/)
  const cwd = process.cwd(); // e.g. .../Branchdeck/webapp
  const candidates = [
    path.isAbsolute(keyPathEnv) ? keyPathEnv : null,
    path.resolve(cwd, '..', keyPathEnv),           // .../Branchdeck/backend/secrets/...
    path.resolve(cwd, keyPathEnv),                  // .../Branchdeck/webapp/backend/secrets/...
    path.resolve(cwd, '..', 'backend', 'secrets', 'github-app-key.pem'), // absolute fallback
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        const content = fs.readFileSync(candidate, 'utf8');
        return { key: content, debug: `loaded from file: ${candidate}` };
      }
    } catch { /* keep trying */ }
  }

  return {
    key: null,
    debug: `Key file not found. Tried paths:\n${candidates.join('\n')}\ncwd=${cwd}`,
  };
}

function generateAppJWT(): { jwt: string | null; debug: string } {
  const { key: privateKey, debug: keyDebug } = loadPrivateKey();

  if (!privateKey) {
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
      exp: now + 540, // 9 minutes
      iss: GITHUB_APP_ID,
    })).toString('base64url');

    const sigInput = `${header}.${payload}`;
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(sigInput);
    const sig = sign.sign(privateKey).toString('base64url');
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
