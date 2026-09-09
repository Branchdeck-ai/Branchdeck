import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || authHeader === 'Bearer ' || authHeader === 'Bearer undefined') {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const res = await fetch(`${BACKEND_URL}/api/admin/overview`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (res.status === 404 || res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
}
