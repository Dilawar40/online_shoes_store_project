import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { data: items, error: itemsErr } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true });

    if (itemsErr) {
      return NextResponse.json({ error: 'Failed to load items' }, { status: 500 });
    }

    return NextResponse.json({ order, items: items || [] });
  } catch (e) {
    console.error('Admin order [id] GET error:', e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
