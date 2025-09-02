import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

const ALLOWED = [
  'pending',
  'confirmed',
  'in_progress',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const nextStatus = (body?.status as string)?.toLowerCase?.();

    if (!id || !nextStatus) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }
    if (!ALLOWED.includes(nextStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data: current, error: findErr } = await supabaseAdmin
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .single();

    if (findErr || !current) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('orders')
      .update({ status: nextStatus })
      .eq('id', id)
      .select()
      .single();

    if (updErr) {
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    // Fire-and-forget email notification (do not block or fail the request on error)
    try {
      const apiKey = process.env.RESEND_API_KEY as string | undefined;
      const to = (updated as any)?.email as string | undefined;
      if (apiKey && to) {
        const token = (updated as any)?.metadata?.public_token as string | undefined;
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || process.env.SITE_URL || '';
        const trackingUrl = token && baseUrl ? `${baseUrl.replace(/\/$/, '')}/orders/${token}` : null;
        const shortId = String(updated.id).split('-')[0];
        const subject = `Your order ${shortId} status: ${nextStatus}`;
        const html = `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111">
            <h2 style="margin:0 0 12px">Order update</h2>
            <p style="margin:0 0 8px">Hi${(updated as any)?.first_name ? ` ${(updated as any).first_name}` : ''},</p>
            <p style="margin:0 0 8px">The status of your order <strong>${updated.id}</strong> has changed to <strong>${nextStatus}</strong>.</p>
            ${trackingUrl ? `<p style="margin:0 0 12px">You can track your order here: <a href="${trackingUrl}">${trackingUrl}</a></p>` : ''}
            <p style="margin:16px 0 0;color:#555">Thank you for shopping with us.</p>
          </div>
        `;

        // Send via Resend HTTP API
        const resp = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'Store <onboarding@resend.dev>',
            to: [to],
            subject,
            html,
          }),
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          console.error('Resend email failed', resp.status, text);
        }
      }
    } catch (e) {
      console.error('Failed to send status email:', e);
    }

    // Fire-and-forget WhatsApp notification
    try {
      const toRaw = (updated as any)?.phone as string | undefined; // e.g., +923001234567
      if (toRaw) {
        const token = (updated as any)?.metadata?.public_token as string | undefined;
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || process.env.SITE_URL || '';
        const trackingUrl = token && baseUrl ? `${baseUrl.replace(/\/$/, '')}/orders/${token}` : null;
        const shortId = String(updated.id).split('-')[0];
        const messageBody = `Order update\nYour order ${shortId} status: ${nextStatus}${trackingUrl ? `\nTrack: ${trackingUrl}` : ''}`;

        // Prefer WhatsApp Cloud API if configured
        const waToken = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN as string | undefined;
        const waPhoneId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID as string | undefined; // numeric ID
        if (waToken && waPhoneId) {
          // Sanitize to international digits only (Cloud API expects number with country code, no '+')
          const toDigits = toRaw.replace(/[^\d]/g, '').replace(/^0+/, '');
          const cloudResp = await fetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(waPhoneId)}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${waToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: toDigits,
              type: 'text',
              text: { body: messageBody, preview_url: true },
            }),
          });
          if (!cloudResp.ok) {
            const text = await cloudResp.text().catch(() => '');
            console.error('WhatsApp Cloud API failed', cloudResp.status, text);
          }
        } else {
          // Fallback to Twilio if configured
          const sid = process.env.TWILIO_ACCOUNT_SID as string | undefined;
          const auth = process.env.TWILIO_AUTH_TOKEN as string | undefined;
          const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM as string | undefined; // 'whatsapp:+14155238886'
          if (sid && auth && fromWhatsApp) {
            const toFormatted = toRaw.startsWith('whatsapp:') ? toRaw : `whatsapp:${toRaw}`;
            const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`;
            const form = new URLSearchParams();
            form.append('From', fromWhatsApp);
            form.append('To', toFormatted);
            form.append('Body', messageBody);

            const resp = await fetch(url, {
              method: 'POST',
              headers: {
                'Authorization': 'Basic ' + Buffer.from(`${sid}:${auth}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: form.toString(),
            });
            if (!resp.ok) {
              const text = await resp.text().catch(() => '');
              console.error('Twilio WhatsApp failed', resp.status, text);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to send WhatsApp message:', e);
    }

    // Fire-and-forget SMS via Textbelt (simple dev-friendly option)
    try {
      const textbeltKey = process.env.TEXTBELT_KEY as string | undefined; // 'textbelt' (free, limited) or paid key
      if (textbeltKey) {
        // Prefer explicit test override phone if provided
        const overridePhone = process.env.NOTIFY_TEST_PHONE as string | undefined;
        const rawPhone = overridePhone || ((updated as any)?.phone as string | undefined);
        if (rawPhone) {
          // Normalize: if starts with 0 and seems PK number, convert to +92..., else keep if starts with +
          let phone = rawPhone.trim();
          if (/^0\d{10}$/.test(phone)) {
            // 03XXXXXXXXX -> +92XXXXXXXXXX
            phone = '+92' + phone.slice(1);
          } else if (!phone.startsWith('+') && /^\d{10,15}$/.test(phone)) {
            // If plain digits without +, try to use as-is (Textbelt expects E.164, but some regions allow local)
          }

          const token = (updated as any)?.metadata?.public_token as string | undefined;
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || process.env.SITE_URL || '';
          const trackingUrl = token && baseUrl ? `${baseUrl.replace(/\/$/, '')}/orders/${token}` : null;
          const shortId = String(updated.id).split('-')[0];
          const smsBody = `Order update: ${shortId} -> ${nextStatus}${trackingUrl ? `\nTrack: ${trackingUrl}` : ''}`;

          const resp = await fetch('https://textbelt.com/text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ phone, message: smsBody, key: textbeltKey }).toString(),
          });
          if (!resp.ok) {
            const txt = await resp.text().catch(() => '');
            console.error('Textbelt SMS failed', resp.status, txt);
          } else {
            const json = await resp.json().catch(() => ({} as any));
            if (!json?.success) {
              console.error('Textbelt SMS response error', json);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to send SMS via Textbelt:', e);
    }

    return NextResponse.json({ order: updated });
  } catch (e) {
    console.error('PATCH /admin/orders/[id]/status error:', e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
