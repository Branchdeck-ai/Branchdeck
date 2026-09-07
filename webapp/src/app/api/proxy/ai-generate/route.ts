// webapp/src/app/api/proxy/ai-generate/route.ts
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const upstreamRes = await fetch(`${BACKEND_URL}/api/proxy/ai-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await upstreamRes.json();

    if (!upstreamRes.ok) {
      return NextResponse.json(data, { status: upstreamRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[NEXT_PROXY_AI_GENERATE_ERROR]', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
