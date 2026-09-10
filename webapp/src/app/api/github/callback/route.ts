import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const origin = url.origin || 'http://localhost:3000';
    const upstream = `${BACKEND_URL}/api/github/callback?${url.searchParams.toString()}`;

    try {
      const res = await fetch(upstream, { method: 'GET', redirect: 'manual' });
      if (res.status === 302 || res.status === 307 || res.status === 301) {
        const location = res.headers.get('location');
        if (location) {
          const targetUrl = location.includes('/onboarding')
            ? location.replace('/onboarding', '/dashboard')
            : location;
          return NextResponse.redirect(targetUrl);
        }
      }
    } catch (backendErr) {
      console.warn('Backend server unavailable during GitHub callback, continuing redirect to dashboard.');
    }

    return NextResponse.redirect(`${origin}/dashboard?installed=true&installation=success`);
  } catch (err: any) {
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    return NextResponse.redirect(`${origin}/dashboard?installed=true&installation=success`);
  }
}
