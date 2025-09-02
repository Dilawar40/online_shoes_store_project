import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const siteBase = (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');

const supabaseAdmin = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null as any;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    // PayFast SA includes m_payment_id and/or our custom_str1. We used custom_str1 for our order id.
    const orderId = params.get('custom_str1') || params.get('m_payment_id') || '';

    if (!orderId || !supabaseAdmin) {
      return NextResponse.redirect(`${siteBase || ''}/checkout/success`);
    }

    // Best-effort: mark order as confirmed. (For production, rely on webhook verification.)
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', orderId)
      .select('id, metadata, email')
      .single();

    if (error || !order) {
      console.error('PayFast return: order update failed', error);
      return NextResponse.redirect(`${siteBase || ''}/checkout/success`);
    }

    // Fire-and-forget: email notification using Resend
    try {
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      const FROM = process.env.RESEND_FROM_EMAIL || 'Store <onboarding@resend.dev>';
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
      const tokenTmp = (order as any)?.metadata?.public_token as string | undefined;
      const trackingUrl = tokenTmp && baseUrl ? `${baseUrl.replace(/\/$/, '')}/orders/${tokenTmp}` : '';
      const shortId = String(order.id).split('-')[0];
      if (RESEND_API_KEY && order.email) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM,
            to: order.email,
            subject: `Order update: ${shortId} confirmed`,
            text: `Hi,\n\nYour payment is successful and order ${order.id} is confirmed.\nTrack here: ${trackingUrl || 'N/A'}\n\nThank you!`,
          }),
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => '');
            console.error('Resend email failed (return):', r.status, t);
          }
        }).catch((e) => console.error('Resend email error (return):', e));
      }
    } catch (e) {
      console.error('Return handler email attempt failed:', e);
    }

    const token = (order as any)?.metadata?.public_token as string | undefined;
    if (token && siteBase) {
      return NextResponse.redirect(`${siteBase}/orders/${token}`);
    }

    return NextResponse.redirect(`${siteBase || ''}/checkout/success`);
  } catch (e) {
    console.error('PayFast return handler error:', e);
    return NextResponse.redirect(`${siteBase || ''}/checkout/success`);
  }
}
