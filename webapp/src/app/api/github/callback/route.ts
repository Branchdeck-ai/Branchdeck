import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const upstream = `${BACKEND_URL}/api/github/callback?${searchParams.toString()}`;

    const res = await fetch(upstream, { method: 'GET', redirect: 'manual' });
    if (res.status === 302 || res.status === 307 || res.status === 301) {
      const location = res.headers.get('location') || '/onboarding?installation=success';
      return NextResponse.redirect(location);
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'GitHub callback handling failed' },
      { status: 500 }
    );
  }
}
