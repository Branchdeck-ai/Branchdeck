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
    let body = {};
    try {
      body = await request.json();
    } catch (_) {}

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    };

    const res = await fetch(`${BACKEND_URL}/api/dashboard/organizations/provision`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
