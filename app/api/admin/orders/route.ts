import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

export async function GET() {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Fetch orders error:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    const orderIds = (orders || []).map((o: any) => o.id);
    let itemsByOrder: Record<string, any[]> = {};

    if (orderIds.length) {
      const { data: items, error: itemsErr } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsErr) {
        console.error('Fetch order_items error:', itemsErr);
        return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 });
      }

      for (const it of items || []) {
        itemsByOrder[it.order_id] = itemsByOrder[it.order_id] || [];
        itemsByOrder[it.order_id].push(it);
      }
    }

    const result = (orders || []).map((o: any) => ({ ...o, items: itemsByOrder[o.id] || [] }));
    return NextResponse.json({ orders: result });
  } catch (e) {
    console.error('Admin orders GET error:', e);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
