import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader === 'Bearer ' || authHeader === 'Bearer undefined') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: missing Authorization header' },
        { status: 401 }
      );
    }
    const body = await request.json();

    const upstream = `${BACKEND_URL}/api/dashboard/repos/connect`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    };

    const res = await fetch(upstream, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to connect repository' },
      { status: 500 }
    );
  }
}
