import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Minimal webhook stub. Logs payload and returns 200 OK to avoid retries.
// TODO: Verify signature/HMAC per PayFast docs and update the order status accordingly.
export async function POST(req: Request) {
  try {
    const raw = await req.text();
    // Some providers post as form-encoded; attempt best-effort parse
    let payload: any = {};
    try {
      payload = JSON.parse(raw);
    } catch {
      const params = new URLSearchParams(raw);
      params.forEach((v, k) => (payload[k] = v));
    }

    console.log('PayFast webhook received:', payload);

    // Example mapping (to be implemented once fields are confirmed):
    // - if payload.status === 'PAID' -> mark order as paid/confirmed
    // - use payload.order_id to locate our order

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error('PayFast webhook error:', e);
    return NextResponse.json({ error: 'webhook-error' }, { status: 200 });
  }
}
