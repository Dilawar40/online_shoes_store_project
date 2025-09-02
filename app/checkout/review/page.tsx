'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Totals = {
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
};

export default function CheckoutReviewPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const c = sessionStorage.getItem('checkoutCustomer');
      const t = sessionStorage.getItem('checkoutTotals');
      const k = sessionStorage.getItem('checkoutCart');
      if (c) setCustomer(JSON.parse(c));
      if (t) setTotals(JSON.parse(t));
      if (k) setCart(JSON.parse(k));
    } catch (e) {
      console.error('Failed to parse checkout data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!customer || !totals || !cart) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-2xl font-semibold">Missing checkout information</h1>
        <p className="text-neutral-600">Please fill your details on the checkout page.</p>
        <Button onClick={() => router.push('/checkout')}>Go to Checkout</Button>
      </div>
    );
  }

  const { currency, subtotal, shippingCost, total } = totals;

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8">
      <h1 className="mb-8 text-3xl font-bold">Review your order</h1>

      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {/* Left: Entered information */}
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Contact</h2>
            <div className="text-sm text-neutral-800">
              <p>{customer.email}</p>
              {customer.emailNews ? <p className="text-neutral-500">Subscribed to email offers</p> : null}
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Delivery</h2>
            <div className="grid gap-2 text-sm text-neutral-800">
              <p>
                {customer.firstName} {customer.lastName}
              </p>
              <p>{customer.address1}</p>
              {customer.address2 ? <p>{customer.address2}</p> : null}
              <p>
                {customer.city} {customer.postalCode ? `, ${customer.postalCode}` : ''}
              </p>
              <p>{customer.country}</p>
              <p>{customer.phone}</p>
              {customer.smsNews ? <p className="text-neutral-500">Subscribed to SMS offers</p> : null}
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="mb-3 text-xl font-semibold">Shipping method</h2>
            <p className="text-sm">
              {customer.shippingMethod === 'express' ? 'Express Delivery (Lahore Only)' : 'Standard Shipping'}
              <span className="ml-2 text-neutral-500">{shippingCost ? `Rs ${shippingCost.toLocaleString()}` : 'FREE'}</span>
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="mb-3 text-xl font-semibold">Payment</h2>
            <p className="text-sm">{customer.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'PAYFAST (to be processed later)'}</p>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="mb-3 text-xl font-semibold">Billing address</h2>
            {customer.billing === 'same' ? (
              <p className="text-sm text-neutral-700">Same as shipping address</p>
            ) : (
              <div className="grid gap-2 text-sm text-neutral-800">
                <p>
                  {customer.billing?.billingFirstName} {customer.billing?.billingLastName}
                </p>
                <p>{customer.billing?.billingAddress1}</p>
                {customer.billing?.billingAddress2 ? <p>{customer.billing?.billingAddress2}</p> : null}
                <p>
                  {customer.billing?.billingCity} {customer.billing?.billingPostalCode ? `, ${customer.billing?.billingPostalCode}` : ''}
                </p>
                <p>{customer.billing?.billingCountry}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => router.push('/checkout')}>Edit information</Button>
            <Button onClick={() => router.push('/')}>Continue shopping</Button>
          </div>
        </div>

        {/* Right: Order summary */}
        <div className="h-fit rounded-lg border p-6 lg:sticky lg:top-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your order</h2>
            <span className="text-sm text-neutral-500">{cart.totalQuantity} item(s)</span>
          </div>

          <div className="space-y-4">
            {(cart.items || []).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-medium">{item.product?.title}</h3>
                  {item.variant?.title ? (
                    <p className="text-sm text-gray-500">{item.variant.title}</p>
                  ) : null}
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
                    (item.price?.amount || 0) * (item.quantity || 0)
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="my-4">
            <div className="flex gap-2">
              <input placeholder="Discount code or gift card" className="w-full rounded-md border px-3 py-2" />
              <Button type="button" variant="secondary">Apply</Button>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shippingCost ? `Rs ${shippingCost.toLocaleString()}` : 'FREE'}</span></div>
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex items-baseline justify-between font-semibold">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)}
              </span>
            </div>
          </div>

          <Button className="mt-6 w-full" size="lg" onClick={() => alert('Information collected. Payment step will be added later.')}>Confirm information</Button>
        </div>
      </div>
      {/* Mobile sticky action bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 p-4 shadow-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div className="">
            <p className="text-xs text-neutral-500">Total</p>
            <p className="text-base font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)}</p>
          </div>
          <Button size="lg" className="flex-1" onClick={() => alert('Information collected. Payment step will be added later.')}>Confirm information</Button>
        </div>
      </div>
    </div>
  );
}
