import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

// PayFast SA optional signature uses a passphrase (if enabled in account):
// signature = md5(querystring(sorted params) + `&passphrase=${passphrase}`)
function signParamsWithPassphrase(params: Record<string, string>, passphrase?: string) {
  if (!passphrase) return undefined;
  const keys = Object.keys(params).sort();
  const qs = keys.map((k) => `${k}=${params[k]}`).join('&');
  const toSign = `${qs}&passphrase=${passphrase}`;
  return crypto.createHash('md5').update(toSign).digest('hex');
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = String(body.amount ?? '0');
    const orderId = String(body.orderId ?? `ord_${Date.now()}`);
    const email = String(body.email ?? 'guest@example.com');
    const name = String(body.name ?? 'Guest');

    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY || '';
    const merchantLogo = process.env.PAYFAST_MERCHANT_LOGO || '';
    const returnUrl = process.env.PAYFAST_RETURN_URL || `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL}/api/payfast/return`;
    const cancelUrl = process.env.PAYFAST_CANCEL_URL || `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`;
    const notifyUrl = process.env.PAYFAST_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL}/api/payfast/webhook`;
    const currency = process.env.PAYFAST_CURRENCY || 'ZAR';
    const environment = process.env.PAYFAST_ENV || 'sandbox';
    const passphrase = process.env.PAYFAST_PASSPHRASE; // optional

    if (!merchantId) {
      return NextResponse.json({ error: 'PAYFAST_MERCHANT_ID missing' }, { status: 400 });
    }

    const baseCheckout = process.env.PAYFAST_CHECKOUT_URL || (environment === 'production'
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process');

    const params: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      amount,
      item_name: `Order ${orderId}`,
      email_address: email,
      name_first: name.split(' ')[0] || 'Guest',
      name_last: name.split(' ').slice(1).join(' ') || 'Customer',
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      currency,
      custom_str1: orderId,
    };
    if (merchantLogo) params.merchant_logo = merchantLogo;

    const signature = signParamsWithPassphrase(params, passphrase);
    if (signature) params.signature = signature;

    const search = new URLSearchParams(params).toString();
    const redirect = `${baseCheckout}?${search}`;
    return NextResponse.json({ redirect });
  } catch (e) {
    console.error('PayFast session error:', e);
    return NextResponse.json({ error: 'Failed to create PayFast session' }, { status: 500 });
  }
}
