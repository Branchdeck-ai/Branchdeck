import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const GITHUB_APP_SLUG = process.env.GITHUB_APP_SLUG || 'branchdeck-ai';

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
        if (data.install_url) {
          return NextResponse.json(data);
        }
      }
    } catch (backendErr) {
      console.warn('[Next.js Proxy] Backend fetch failed, falling back to direct GitHub App installation URL:', backendErr);
    }

    // Direct Next.js fallback URL generator when BACKEND_URL is unreachable on Vercel
    const installUrl = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`;

    return NextResponse.json({
      success: true,
      install_url: installUrl,
      organization_id: 'org-selfserve-default'
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      install_url: `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`,
      organization_id: 'org-selfserve-default'
    });
  }
}
