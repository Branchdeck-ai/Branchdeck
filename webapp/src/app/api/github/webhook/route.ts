import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const rawBody = await request.arrayBuffer();
    const signature = request.headers.get('x-hub-signature-256') || '';
    const event = request.headers.get('x-github-event') || 'ping';
    const delivery = request.headers.get('x-github-delivery') || '';

    const headers: Record<string, string> = {
      'Content-Type': request.headers.get('content-type') || 'application/json',
      'X-Hub-Signature-256': signature,
      'X-GitHub-Event': event,
      'X-GitHub-Delivery': delivery,
    };

    let res: Response;
    try {
      res = await fetch(`${BACKEND_URL}/api/github/webhook`, {
        method: 'POST',
        headers,
        body: rawBody,
      });
    } catch (backendErr: any) {
      console.error('[Webhook Proxy Error] Backend unreachable:', backendErr);
      return NextResponse.json(
        { success: false, error: 'Backend webhook service unavailable', detail: backendErr?.message || 'Connection refused' },
        { status: 502 }
      );
    }

    const data = await res.json().catch(() => ({ success: res.ok }));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Webhook proxy error' },
      { status: 500 }
    );
  }
}
