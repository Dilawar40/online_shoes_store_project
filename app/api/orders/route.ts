import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for secure server-side writes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !serviceKey) {
  console.warn('Supabase URL or Service Role Key is missing. Ensure env vars are set.');
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      customer,
      shippingMethod,
      paymentMethod,
      totals,
      items
    } = body as {
      customer: any;
      shippingMethod: string;
      paymentMethod: string;
      totals: {
        subtotal: number;
        shippingCost: number;
        discountAmount: number;
        total: number;
        currency: string;
        discountCode?: string | null;
      };
      items: Array<{
        id: string;
        product: { title: string; images?: { url: string; altText?: string }[] };
        variant: { id: string; title: string };
        quantity: number;
        price: { amount: number; currencyCode: string };
      }>;
    };

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const publicToken = (globalThis.crypto?.randomUUID && globalThis.crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Insert order row
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        status: 'pending',
        payment_method: paymentMethod,
        email: customer.email || null,
        phone: customer.phone || null,
        first_name: customer.firstName || null,
        last_name: customer.lastName || null,
        shipping_address: {
          country: customer.country,
          address1: customer.address1,
          address2: customer.address2,
          city: customer.city,
          postalCode: customer.postalCode,
        },
        billing_address: customer.billing === 'same' ? null : customer.billing,
        shipping_method: shippingMethod,
        subtotal: totals.subtotal,
        discount_amount: totals.discountAmount,
        shipping_cost: totals.shippingCost,
        total: totals.total,
        currency_code: totals.currency,
        metadata: {
          discount_code: totals.discountCode || null,
          email_news: customer.emailNews,
          sms_news: customer.smsNews,
          public_token: publicToken,
        },
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order insert error:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Insert order items
    const orderItemsPayload = items.map((i) => ({
      order_id: order.id,
      product_id: i.id,
      product_title: i.product?.title ?? 'Product',
      variant_id: i.variant?.id ?? null,
      variant_title: i.variant?.title ?? null,
      quantity: i.quantity,
      unit_price: i.price.amount,
      currency_code: i.price.currencyCode,
      image_url: i.product?.images?.[0]?.url ?? null,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) {
      console.error('Order items insert error:', itemsError);
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    return NextResponse.json({ id: order.id, tracking_token: publicToken }, { status: 201 });
  } catch (err) {
    console.error('Orders route error:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
