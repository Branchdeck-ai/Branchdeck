import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const upstream = `${BACKEND_URL}/api/github/callback?${searchParams.toString()}`;

    try {
      const res = await fetch(upstream, { method: 'GET', redirect: 'manual', cache: 'no-store' });
      if (res.status === 302 || res.status === 307 || res.status === 301) {
        const location = res.headers.get('location') || '/onboarding?installation=success';
        return NextResponse.redirect(location);
      }

      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch {
      // Fallback if backend is unavailable on Vercel cloud serverless
      const requestUrl = new URL(request.url);
      const origin = requestUrl.origin;
      return NextResponse.redirect(`${origin}/onboarding?installation=success`);
    }
  } catch (err: any) {
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(`${requestUrl.origin}/onboarding?installation=success`);
  }
}
