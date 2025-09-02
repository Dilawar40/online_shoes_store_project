"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [nextStatus, setNextStatus] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/admin/login");
          return;
        }
        if (!id) return;
        const res = await fetch(`/api/admin/orders/${id}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const json = await res.json();
        setOrder(json.order);
        setItems(json.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <button className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200" onClick={() => router.push('/admin/orders')}>Back</button>
        </div>
        <p className="text-red-600">Order not found.</p>
      </div>
    );
  }

  const currency = order.currency_code || 'PKR';
  const currentStatus = (order.status as string) || 'pending';
  const allowed = [
    'pending',
    'confirmed',
    'in_progress',
    'shipped',
    'delivered',
    'completed',
    'cancelled',
  ];

  const updateStatus = async () => {
    if (!nextStatus || nextStatus === currentStatus) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || 'Failed to update status');
        return;
      }
      const j = await res.json();
      setOrder(j.order);
      setNextStatus(null);

      // Broadcast the status change to customer tracking page via Supabase Realtime
      const token = j.order?.metadata?.public_token;
      if (token) {
        const channel = supabase.channel(`order:${token}`);
        await channel.subscribe((status) => {
          // Immediately after subscribed, send the event and unsubscribe to avoid leaks
          channel.send({ type: 'broadcast', event: 'status', payload: { status: j.order.status } });
          setTimeout(() => {
            supabase.removeChannel(channel);
          }, 0);
          return undefined;
        });
      }
    } catch (e) {
      console.error(e);
      alert('Unexpected error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order {order.id}</h1>
          <p className="text-sm text-gray-600 mt-1">Created: {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={nextStatus ?? currentStatus}
            onChange={(e) => setNextStatus(e.target.value)}
          >
            {allowed.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50"
            onClick={updateStatus}
            disabled={saving || !nextStatus || nextStatus === currentStatus}
          >
            {saving ? 'Saving…' : 'Update status'}
          </button>
          <button
            className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
            onClick={async () => {
              const token = order?.metadata?.public_token;
              if (!token) {
                alert('No tracking token on this order');
                return;
              }
              const origin = typeof window !== 'undefined' ? window.location.origin : '';
              const url = `${origin}/orders/${token}`;
              try {
                await navigator.clipboard.writeText(url);
                alert('Tracking link copied');
              } catch {
                alert(url);
              }
            }}
          >
            Copy tracking link
          </button>
          <button className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200" onClick={() => router.push('/admin/orders')}>Back to Orders</button>
        </div>
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
                        <td className="px-4 py-3 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(it.unit_price || 0)}</td>
                        <td className="px-4 py-3 text-right">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format((it.unit_price || 0) * (it.quantity || 0))}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Contact</h3>
                <p className="text-sm">{order.first_name || ''} {order.last_name || ''}</p>
                <p className="text-sm text-gray-600">{order.email || '-'}</p>
                <p className="text-sm text-gray-600">{order.phone || '-'}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Payment</h3>
                <p className="text-sm">Method: {order.payment_method?.toUpperCase?.() || '-'}</p>
                <p className="text-sm">Status: <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100">{order.status}</span></p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Addresses</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Shipping address</h3>
                <Address addr={order.shipping_address} />
              </div>
              <div>
                <h3 className="font-medium mb-2">Billing address</h3>
                {order.billing_address ? (
                  <Address addr={order.billing_address} />
                ) : (
                  <p className="text-sm text-gray-600">Same as shipping</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white rounded shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(order.subtotal || 0)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>-{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(order.discount_amount || 0)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(order.shipping_cost || 0)}</span></div>
              <div className="border-t pt-3 flex justify-between font-semibold"><span>Total</span><span>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(order.total || 0)}</span></div>
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
