import { NextResponse } from 'next/server';
import crypto from 'crypto';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const GITHUB_APP_ID = process.env.GITHUB_APP_ID || '4859789';
const GITHUB_APP_PRIVATE_KEY_PATH = process.env.GITHUB_APP_PRIVATE_KEY_PATH;
const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY;

function loadPrivateKey(): string | null {
  if (GITHUB_APP_PRIVATE_KEY) {
    return GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, '\n');
  }
  if (GITHUB_APP_PRIVATE_KEY_PATH) {
    try {
      const fs = require('fs');
      const path = require('path');
      const absPath = path.isAbsolute(GITHUB_APP_PRIVATE_KEY_PATH)
        ? GITHUB_APP_PRIVATE_KEY_PATH
        : path.resolve(process.cwd(), '..', GITHUB_APP_PRIVATE_KEY_PATH);
      if (fs.existsSync(absPath)) {
        return fs.readFileSync(absPath, 'utf8');
      }
    } catch {}
  }
  return null;
}

function generateAppJWT(): string | null {
  const privateKey = loadPrivateKey();
  if (!privateKey || !GITHUB_APP_ID) return null;

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
    const sig = sign.sign(privateKey).toString('base64url');
    return `${sigInput}.${sig}`;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const body = await request.json().catch(() => ({}));
    const { organization_id, installation_id } = body;

    if (!organization_id) {
      return NextResponse.json({ success: false, error: 'organization_id is required' }, { status: 400 });
    }

    let repos: Array<{ name: string; full_name: string; html_url: string; id: number }> = [];

    // Attempt to fetch repos from GitHub App installation
    const appJWT = generateAppJWT();
    if (appJWT) {
      try {
        // If installation_id provided, use it directly; otherwise list all installations
        let installationId = installation_id;
        if (!installationId) {
          const instRes = await fetch('https://api.github.com/app/installations', {
            headers: {
              Authorization: `Bearer ${appJWT}`,
              Accept: 'application/vnd.github+json',
              'User-Agent': 'Branchdeck-AIApp/1.0',
            },
          });
          if (instRes.ok) {
            const instData = await instRes.json();
            if (Array.isArray(instData) && instData.length > 0) {
              installationId = instData[0].id;
            }
          }
        }

        if (installationId) {
          // Get installation access token
          const tokenRes = await fetch(
            `https://api.github.com/app/installations/${installationId}/access_tokens`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${appJWT}`,
                Accept: 'application/vnd.github+json',
                'User-Agent': 'Branchdeck-AIApp/1.0',
              },
            }
          );
          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            const installToken = tokenData.token;

            // Fetch repos for this installation
            const reposRes = await fetch('https://api.github.com/installation/repositories?per_page=100', {
              headers: {
                Authorization: `Bearer ${installToken}`,
                Accept: 'application/vnd.github+json',
                'User-Agent': 'Branchdeck-AIApp/1.0',
              },
            });
            if (reposRes.ok) {
              const reposData = await reposRes.json();
              repos = (reposData.repositories || []).map((r: any) => ({
                name: r.name,
                full_name: r.full_name,
                html_url: r.html_url,
                id: r.id,
              }));
            }
          }
        }
      } catch (ghErr) {
        console.warn('[sync-repos] GitHub API error:', ghErr);
      }
    }

    if (repos.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Could not fetch repositories from GitHub. Make sure the GitHub App private key is configured and the app is installed.',
        repos: [],
      }, { status: 422 });
    }

    // Register repos via backend
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
            github_installation_id: installation_id,
            repo_name: repo.name,
          }),
        });
        if (backendRes.ok) {
          registered.push(repo.name);
        } else {
          failed.push(repo.name);
        }
      } catch {
        failed.push(repo.name);
      }
    }

    return NextResponse.json({
      success: true,
      repos,
      registered,
      failed,
      message: `Found ${repos.length} repo(s) from GitHub App installation. Registered: ${registered.length}, Failed to save: ${failed.length}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
