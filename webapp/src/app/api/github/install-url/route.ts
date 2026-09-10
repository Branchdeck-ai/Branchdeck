import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const GITHUB_APP_SLUG = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || process.env.GITHUB_APP_SLUG || 'branchdeck-ai';

export async function GET(request: Request) {
  const fallbackUrl = `https://github.com/apps/${GITHUB_APP_SLUG}`;

  try {
    const authHeader = request.headers.get('Authorization');

    // Attempt to fetch signed install URL from FastAPI backend if available
    try {
      const res = await fetch(`${BACKEND_URL}/api/github/install-url`, {
        method: 'GET',
        headers: {
          Authorization: authHeader || '',
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.install_url) {
          return NextResponse.json(data, { status: res.status });
        }
      }
    } catch (backendErr) {
      console.warn('Backend server unavailable for /api/github/install-url, using direct App URL fallback.');
    }

    // Return resilient fallback response
    return NextResponse.json({
      success: true,
      install_url: fallbackUrl,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      install_url: fallbackUrl,
    });
  }
}
