import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    // SECURITY: Reject unauthenticated requests at the BFF layer before forwarding upstream.
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    const upstream = new URL(`${BACKEND_URL}/api/dashboard/repos`);
    if (organizationId) {
      upstream.searchParams.set('organization_id', organizationId);
    }

    const res = await fetch(upstream.toString(), {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
