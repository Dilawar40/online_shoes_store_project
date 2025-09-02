import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('metadata->>public_token', token)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { data: items, error: itemsErr } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    if (itemsErr) {
      return NextResponse.json({ error: 'Failed to load items' }, { status: 500 });
    }

    // Return a safe subset for customers
    const safeOrder = {
      id: order.id,
      created_at: order.created_at,
      status: order.status,
      payment_method: order.payment_method,
      shipping_method: order.shipping_method,
      subtotal: order.subtotal,
      discount_amount: order.discount_amount,
      shipping_cost: order.shipping_cost,
      total: order.total,
      currency_code: order.currency_code,
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      metadata: {
        discount_code: order.metadata?.discount_code || null,
      },
    };

    return NextResponse.json({ order: safeOrder, items: items || [] });
  } catch (e) {
    console.error('Track order GET error:', e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
