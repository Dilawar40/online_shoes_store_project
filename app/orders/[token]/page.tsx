"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function OrderTrackingPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let interval: any;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const load = async () => {
      try {
        if (!token) return;
        const res = await fetch(`/api/orders/track/${token}`);
        if (!res.ok) {
          setOrder(null);
          return;
        }
        const j = await res.json();
        setOrder(j.order);
        setItems(j.items || []);
        setLastUpdated(new Date());
      } finally {
        setLoading(false);
      }
    };
    load();
    interval = setInterval(load, 10000);

    // Subscribe to realtime broadcast from admin page for instant status updates
    if (token) {
      channel = supabase.channel(`order:${token}`);
      channel
        .on('broadcast', { event: 'status' }, (payload: any) => {
          if (payload?.payload?.status) {
            setOrder((prev: any) => prev ? { ...prev, status: payload.payload.status } : prev);
            setLastUpdated(new Date());
          }
        })
        .subscribe();
    }
    return () => {
      clearInterval(interval);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Order not found</h1>
        <p className="text-gray-600 mb-6">The tracking link might be invalid or expired.</p>
        <button className="px-4 py-2 bg-gray-900 text-white rounded" onClick={() => router.push('/')}>Go to home</button>
      </div>
    );
  }

  const currency = order.currency_code || 'PKR';
  const nf = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n || 0);

  const steps = [
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'in_progress', label: 'In progress' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'completed', label: 'Completed' },
  ];

  const idx = steps.findIndex(s => s.key === order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Order Tracking</h1>
        <p className="text-gray-600 mt-1">Order ID: <span className="font-mono text-xs">{order.id}</span></p>
        <p className="text-gray-600">Placed on: {new Date(order.created_at).toLocaleString()}</p>
        {lastUpdated ? (
          <p className="text-xs text-gray-500 mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        ) : null}
      </div>

      {/* Status timeline */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Status: <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-sm">{order.status}</span></h2>
        <ol className="flex flex-wrap items-center gap-3">
          {steps.map((s, i) => {
            const active = idx >= i;
            return (
              <li key={s.key} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${active ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                <span className={`${active ? 'text-green-700' : 'text-gray-500'} text-sm`}>{s.label}</span>
                {i < steps.length - 1 && <span className={`mx-2 h-px w-8 ${active && idx > i ? 'bg-green-400' : 'bg-gray-200'}`}></span>}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Product</th>
                    <th className="px-4 py-2 text-left font-semibold">Variant</th>
                    <th className="px-4 py-2 text-right font-semibold">Qty</th>
                    <th className="px-4 py-2 text-right font-semibold">Unit Price</th>
                    <th className="px-4 py-2 text-right font-semibold">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>No items</td>
                    </tr>
                  ) : (
                    items.map((it) => (
                      <tr key={it.id} className="border-t">
                        <td className="px-4 py-3">{it.product_title || it.product_id}</td>
                        <td className="px-4 py-3">{it.variant_title || it.variant_id || '-'}</td>
                        <td className="px-4 py-3 text-right">{it.quantity}</td>
                        <td className="px-4 py-3 text-right">{nf(it.unit_price || 0)}</td>
                        <td className="px-4 py-3 text-right">{nf((it.unit_price || 0) * (it.quantity || 0))}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping address</h2>
            <Address addr={order.shipping_address} />
          </section>

          <section className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Billing address</h2>
            {order.billing_address ? (
              <Address addr={order.billing_address} />
            ) : (
              <p className="text-sm text-gray-600">Same as shipping</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{nf(order.subtotal || 0)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>-{nf(order.discount_amount || 0)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{nf(order.shipping_cost || 0)}</span></div>
              <div className="border-t pt-3 flex justify-between font-semibold"><span>Total</span><span>{nf(order.total || 0)}</span></div>
            </div>
          </section>

          {order.metadata?.discount_code ? (
            <section className="bg-white rounded shadow p-6">
              <h2 className="text-lg font-semibold mb-2">Discount code</h2>
              <p className="text-sm">{order.metadata.discount_code}</p>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Address({ addr }: { addr: any }) {
  if (!addr) return <p className="text-sm text-gray-600">No address</p>;
  return (
    <div className="text-sm text-gray-800">
      {addr.billingFirstName || addr.firstName || addr.name ? (
        <p>{addr.billingFirstName || addr.firstName || ''} {addr.billingLastName || addr.lastName || ''}</p>
      ) : null}
      {addr.address1 || addr.billingAddress1 ? <p>{addr.address1 || addr.billingAddress1}</p> : null}
      {addr.address2 || addr.billingAddress2 ? <p>{addr.address2 || addr.billingAddress2}</p> : null}
      {(addr.city || addr.billingCity) ? (
        <p>
          {addr.city || addr.billingCity}
          {addr.postalCode || addr.billingPostalCode ? `, ${addr.postalCode || addr.billingPostalCode}` : ''}
        </p>
      ) : null}
      {addr.country || addr.billingCountry ? <p>{addr.country || addr.billingCountry}</p> : null}
    </div>
  );
}
