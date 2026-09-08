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

    try {
      const res = await fetch(`${BACKEND_URL}/api/github/webhook`, {
        method: 'POST',
        headers,
        body: rawBody,
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({ success: true }));
        return NextResponse.json(data, { status: 200 });
      }
    } catch (backendErr) {
      console.warn('[Webhook Proxy] Backend unreachable, acknowledging webhook directly:', backendErr);
    }

    return NextResponse.json(
      { success: true, event, message: 'GitHub Webhook received and acknowledged by Branchdeck' },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: true, message: 'Webhook received and acknowledged' },
      { status: 200 }
    );
  }
}
