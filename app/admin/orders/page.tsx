"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/admin/login");
          return;
        }
        const res = await fetch("/api/admin/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const json = await res.json();
        setOrders(json.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
          onClick={() => router.push("/admin")}
        >
          Back to Dashboard
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Order ID</th>
              <th className="px-4 py-3 text-left font-semibold">Created</th>
              <th className="px-4 py-3 text-left font-semibold">Customer</th>
              <th className="px-4 py-3 text-left font-semibold">Payment</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((o: any) => (
                <tr
                  key={o.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/admin/orders/${o.id}`)}
                >
                  <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                  <td className="px-4 py-3">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{o.first_name || ''} {o.last_name || ''}<div className="text-xs text-gray-500">{o.email || o.phone || '-'}</div></td>
                  <td className="px-4 py-3">{o.payment_method?.toUpperCase?.() || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: o.currency_code || 'PKR' }).format(o.total || 0)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
