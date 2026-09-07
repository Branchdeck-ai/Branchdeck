import { NextResponse } from 'next/server';
import crypto from 'crypto';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'branchdeck-super-secret-jwt-key-2026';
const GITHUB_APP_SLUG = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || 'branchdeck-ai';

function signStateJwt(orgId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    organization_id: orgId,
    iat: now,
    exp: now + 1800
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SUPABASE_JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const upstream = `${BACKEND_URL}/api/github/install-url`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) headers['Authorization'] = authHeader;

    try {
      const res = await fetch(upstream, { method: 'GET', headers, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      }
    } catch {
      // Backend unavailable on cloud serverless — fallback to Node.js Crypto JWT state generation
    }

    const stateToken = signStateJwt('org-demo-resummit');
    const installUrl = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new?state=${stateToken}`;

    return NextResponse.json({
      success: true,
      install_url: installUrl,
      organization_id: 'org-demo-resummit'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to generate installation URL' },
      { status: 500 }
    );
  }
}
