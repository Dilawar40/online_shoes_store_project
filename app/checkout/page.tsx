'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

type CartItem = {
  id: string;
  product: {
    title: string;
    images?: { url: string; altText?: string }[];
  };
  variant: {
    id: string;
    title: string;
  };
  quantity: number;
  price: {
    amount: number;
    currencyCode: string;
  };
};

type Cart = {
  id: string;
  items: CartItem[];
  total: number;
  totalQuantity: number;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Contact
  const [email, setEmail] = useState('');
  const [emailNews, setEmailNews] = useState(true);

  // Delivery
  const [country, setCountry] = useState('Pakistan');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [smsNews, setSmsNews] = useState(false);

  // Shipping method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'payfast' | 'cod' | 'card'>('payfast');

  // Discount
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<
    | { code: string; type: 'percent' | 'flat' | 'freeship'; value: number }
    | null
  >(null);

  // Billing address
  const [billingSame, setBillingSame] = useState(true);
  const [billingFirstName, setBillingFirstName] = useState('');
  const [billingLastName, setBillingLastName] = useState('');
  const [billingAddress1, setBillingAddress1] = useState('');
  const [billingAddress2, setBillingAddress2] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingPostalCode, setBillingPostalCode] = useState('');
  const [billingCountry, setBillingCountry] = useState('Pakistan');

  useEffect(() => {
    // Get cart from session storage
    const cartData = sessionStorage.getItem('checkoutCart');
    if (!cartData) {
      console.error('No cart data found in session storage');
      router.push('/cart');
      return;
    }

    try {
      const parsedCart = JSON.parse(cartData);
      console.log('Loaded cart in checkout:', parsedCart);
      setCart(parsedCart);
    } catch (error) {
      console.error('Error parsing cart data:', error);
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mb-6">Add some items to your cart before checking out.</p>
        <Button onClick={() => router.push('/')}>Continue Shopping</Button>
      </div>
    );
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.price.amount * i.quantity, 0);
  const currency = cart.items[0]?.price.currencyCode || 'PKR';
  const baseShipping = shippingMethod === 'express' ? 1500 : 0;
  const shippingCost = appliedDiscount?.type === 'freeship' ? 0 : baseShipping;
  const percentOff = appliedDiscount?.type === 'percent' ? appliedDiscount.value : 0;
  const flatOff = appliedDiscount?.type === 'flat' ? appliedDiscount.value : 0;
  const discountAmount = Math.min(
    Math.round(percentOff ? (subtotal * percentOff) / 100 : flatOff),
    subtotal
  );
  const total = Math.max(subtotal + shippingCost - discountAmount, 0);

  // Form validity (same rules as handlePayNow basic validation)
  const shippingValid = !!(email && firstName && lastName && address1 && city);
  const billingValid = billingSame
    ? true
    : !!(
        billingFirstName &&
        billingLastName &&
        billingAddress1 &&
        billingCity &&
        billingPostalCode
      );
  const isFormValid = shippingValid && billingValid && !!paymentMethod && !!shippingMethod;

  const applyDiscount = () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) return;
    if (code === 'SAVE10') {
      setAppliedDiscount({ code, type: 'percent', value: 10 });
      return;
    }
    if (code === 'FLAT500') {
      setAppliedDiscount({ code, type: 'flat', value: 500 });
      return;
    }
    if (code === 'FREESHIP') {
      setAppliedDiscount({ code, type: 'freeship', value: 0 });
      return;
    }
    alert('Invalid discount code');
    setAppliedDiscount(null);
  };

  const handlePayNow = async () => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);

    // For now: only collect and persist info, then move to in-app review page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('checkoutCustomer', JSON.stringify({
        email, emailNews, country, firstName, lastName, address1, address2, city, postalCode, phone,
        billing: billingSame ? 'same' : { billingFirstName, billingLastName, billingAddress1, billingAddress2, billingCity, billingPostalCode, billingCountry },
        shippingMethod, paymentMethod,
      }));
      sessionStorage.setItem('checkoutTotals', JSON.stringify({ subtotal, shippingCost, discountAmount, discountCode: appliedDiscount?.code || null, total, currency }));
    }
    try {
      if (paymentMethod === 'payfast') {
        // 1) Create an order so it appears in Admin immediately (status 'unpaid')
        const createOrderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: {
              email,
              emailNews,
              country,
              firstName,
              lastName,
              address1,
              address2,
              city,
              postalCode,
              phone,
              smsNews,
              billing: billingSame
                ? 'same'
                : {
                    billingFirstName,
                    billingLastName,
                    billingAddress1,
                    billingAddress2,
                    billingCity,
                    billingPostalCode,
                    billingCountry,
                  },
            },
            shippingMethod,
            paymentMethod, // 'payfast'
            totals: {
              subtotal,
              shippingCost,
              discountAmount,
              total,
              currency,
              discountCode: appliedDiscount?.code || null,
            },
            items: cart?.items || [],
          }),
        });
        if (!createOrderRes.ok) {
          const j = await createOrderRes.json().catch(() => ({}));
          alert(j?.error || 'Failed to create order');
          return;
        }
        const { id: createdOrderId, tracking_token } = await createOrderRes.json();
        if (typeof window !== 'undefined' && tracking_token) {
          sessionStorage.setItem('trackingToken', tracking_token);
        }
        // Persist ordered items (append to any existing) and reset cart locally so cart UI shows ordered list similarly to COD
        if (typeof window !== 'undefined') {
          try {
            const existingRaw = sessionStorage.getItem('orderedItems');
            const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
            const newItems = Array.isArray(cart?.items) ? cart!.items : [];
            const merged = [...existing, ...newItems];
            sessionStorage.setItem('orderedItems', JSON.stringify(merged));
            localStorage.removeItem('localCart');
            sessionStorage.removeItem('checkoutCart');
            window.dispatchEvent(new Event('cart:reset'));
          } catch {}
        }

        // 2) Create PayFast session using the real order id
        const res = await fetch('/api/payfast/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(total),
            orderId: createdOrderId,
            email,
            name: `${firstName} ${lastName}`.trim() || 'Guest',
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          alert(j?.error || 'Failed to initialize PayFast');
          return;
        }
        const data = await res.json();
        if (data?.redirect) {
          window.location.href = data.redirect;
          return; // stop further navigation
        }
      }
      router.push('/checkout/review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);

    // Persist details for review/thank-you
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'checkoutCustomer',
        JSON.stringify({
          email,
          emailNews,
          country,
          firstName,
          lastName,
          address1,
          address2,
          city,
          postalCode,
          phone,
          billing: billingSame
            ? 'same'
            : {
                billingFirstName,
                billingLastName,
                billingAddress1,
                billingAddress2,
                billingCity,
                billingPostalCode,
                billingCountry,
              },
          shippingMethod,
          paymentMethod,
        })
      );
      sessionStorage.setItem(
        'checkoutTotals',
        JSON.stringify({
          subtotal,
          shippingCost,
          discountAmount,
          discountCode: appliedDiscount?.code || null,
          total,
          currency,
        })
      );
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            email,
            emailNews,
            country,
            firstName,
            lastName,
            address1,
            address2,
            city,
            postalCode,
            phone,
            smsNews,
            billing: billingSame
              ? 'same'
              : {
                  billingFirstName,
                  billingLastName,
                  billingAddress1,
                  billingAddress2,
                  billingCity,
                  billingPostalCode,
                  billingCountry,
                },
          },
          shippingMethod,
          paymentMethod,
          totals: {
            subtotal,
            shippingCost,
            discountAmount,
            total,
            currency,
            discountCode: appliedDiscount?.code || null,
          },
          items: cart?.items || [],
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || 'Failed to create order');
        return;
      }

      const { id, tracking_token } = await res.json();
      // Save ordered items for displaying in cart modal under "Ordered items" (append to any existing)
      if (typeof window !== 'undefined') {
        try {
          const existingRaw = sessionStorage.getItem('orderedItems');
          const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
          const newItems = Array.isArray(cart?.items) ? cart!.items : [];
          const merged = [...existing, ...newItems];
          sessionStorage.setItem('orderedItems', JSON.stringify(merged));
        } catch {}
      }

      // Clear local (guest) cart and notify app to reset cart state
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('localCart');
          sessionStorage.removeItem('checkoutCart');
          // Dispatch a custom event so providers listening can reset in-memory cart
          window.dispatchEvent(new Event('cart:reset'));
        } catch {}
      }
      if (tracking_token) {
        router.push(`/orders/${tracking_token}`);
      } else {
        router.push('/checkout/review');
      }
    } catch (e) {
      console.error('Failed to complete order:', e);
      alert('Unexpected error while creating order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        {/* Left: Customer info */}
        <div className="xl:col-span-2 space-y-8">
          {/* Contact */}
          <div className="rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Contact</h2>
              <button className="text-sm text-blue-600 hover:underline" type="button">Log in</button>
            </div>
            <div className="space-y-3">
              <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="Email or mobile phone number" className="w-full rounded-md border px-3 py-2 outline-none focus:ring" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={emailNews} onChange={(e)=>setEmailNews(e.target.checked)} />
                Email me with news and offers
              </label>
            </div>
          </div>

          {/* Delivery */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Delivery</h2>
            <div>
              <select value={country} onChange={(e)=>setCountry(e.target.value)} className="w-full rounded-md border px-3 py-2">
                <option>Pakistan</option>
                <option>United Kingdom</option>
                <option>United Arab Emirates</option>
                <option>United States</option>
                <option>India</option>
                <option>Saudi Arabia</option>
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} placeholder="First name" className="rounded-md border px-3 py-2" />
              <input value={lastName} onChange={(e)=>setLastName(e.target.value)} placeholder="Last name" className="rounded-md border px-3 py-2" />
            </div>
            <input value={address1} onChange={(e)=>setAddress1(e.target.value)} placeholder="Address" className="w-full rounded-md border px-3 py-2" />
            <input value={address2} onChange={(e)=>setAddress2(e.target.value)} placeholder="Apartment, suite, etc. (optional)" className="w-full rounded-md border px-3 py-2" />
            <div className="grid gap-3 sm:grid-cols-3">
              <input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="City" className="rounded-md border px-3 py-2" />
              <input value={postalCode} onChange={(e)=>setPostalCode(e.target.value)} placeholder="Postal code" className="rounded-md border px-3 py-2" />
              <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Phone" className="rounded-md border px-3 py-2" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={smsNews} onChange={(e)=>setSmsNews(e.target.checked)} />
              Text me with news and offers
            </label>
          </div>

          {/* Shipping method */}
          <div className="rounded-lg border p-6 space-y-3">
            <h2 className="text-xl font-semibold">Shipping method</h2>
            <label className="flex items-center justify-between gap-4 rounded-md border p-3">
              <span className="flex items-center gap-2">
                <input type="radio" name="ship" checked={shippingMethod==='standard'} onChange={()=>setShippingMethod('standard')} />
                Standard Shipping
              </span>
              <span className="text-sm">FREE</span>
            </label>
            <label className="flex items-center justify-between gap-4 rounded-md border p-3">
              <span className="flex items-center gap-2">
                <input type="radio" name="ship" checked={shippingMethod==='express'} onChange={()=>setShippingMethod('express')} />
                Express Delivery (Lahore Only)
              </span>
              <span className="text-sm">Rs 1,500.00</span>
            </label>
          </div>

          {/* Payment */}
          <div className="rounded-lg border p-6 space-y-3">
            <h2 className="text-xl font-semibold">Payment</h2>
            <p className="text-sm text-neutral-600">All transactions are secure and encrypted.</p>
            <label className="flex items-center gap-2 rounded-md border p-3 opacity-50">
              <input type="radio" name="pay" disabled checked={paymentMethod==='card'} onChange={()=>setPaymentMethod('card')} />
              Credit card
            </label>
            <label className="flex flex-col gap-1 rounded-md border p-3">
              <span className="flex items-center gap-2">
                <input type="radio" name="pay" checked={paymentMethod==='payfast'} onChange={()=>setPaymentMethod('payfast')} />
                Additional payment methods — PAYFAST (Debit/Credit/Wallet/Bank Account)
              </span>
              <span className="text-xs text-neutral-600">After clicking “Pay now”, you will be redirected to PAYFAST to complete your purchase securely.</span>
            </label>
            <label className="flex items-center gap-2 rounded-md border p-3">
              <input type="radio" name="pay" checked={paymentMethod==='cod'} onChange={()=>setPaymentMethod('cod')} />
              Cash on Delivery (COD)
            </label>
            <div className="pt-2">
              <Button
                className="w-full"
                size="lg"
                onClick={paymentMethod === 'cod' ? handleCompleteOrder : handlePayNow}
                disabled={!isFormValid}
                title={!isFormValid ? 'Please complete required details to continue' : undefined}
              >
                {paymentMethod === 'cod' ? 'Complete order' : 'Pay now'}
              </Button>
            </div>
          </div>

          {/* Billing address */}
          <div className="rounded-lg border p-6 space-y-3">
            <h2 className="text-xl font-semibold">Billing address</h2>
            <label className="flex items-center gap-2">
              <input type="radio" name="bill" checked={billingSame} onChange={()=>setBillingSame(true)} />
              Same as shipping address
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="bill" checked={!billingSame} onChange={()=>setBillingSame(false)} />
              Use a different billing address
            </label>
            {!billingSame && (
              <div className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={billingFirstName} onChange={(e)=>setBillingFirstName(e.target.value)} placeholder="First name" className="rounded-md border px-3 py-2" />
                  <input value={billingLastName} onChange={(e)=>setBillingLastName(e.target.value)} placeholder="Last name" className="rounded-md border px-3 py-2" />
                </div>
                <input value={billingAddress1} onChange={(e)=>setBillingAddress1(e.target.value)} placeholder="Address" className="w-full rounded-md border px-3 py-2" />
                <input value={billingAddress2} onChange={(e)=>setBillingAddress2(e.target.value)} placeholder="Apartment, suite, etc. (optional)" className="w-full rounded-md border px-3 py-2" />
                <div className="grid gap-3 sm:grid-cols-3">
                  <input value={billingCity} onChange={(e)=>setBillingCity(e.target.value)} placeholder="City" className="rounded-md border px-3 py-2" />
                  <input value={billingPostalCode} onChange={(e)=>setBillingPostalCode(e.target.value)} placeholder="Postal code" className="rounded-md border px-3 py-2" />
                  <select value={billingCountry} onChange={(e)=>setBillingCountry(e.target.value)} className="rounded-md border px-3 py-2">
                    <option>Pakistan</option>
                    <option>United Kingdom</option>
                    <option>United States</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="h-fit rounded-lg border p-6 lg:sticky lg:top-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your order</h2>
            <span className="text-sm text-neutral-500">{cart.totalQuantity} item(s)</span>
          </div>
          <div className="space-y-4">
            {cart.items.map((item) => {
              const thumb = item.product?.images?.[0]?.url || '/placeholder-product.jpg';
              const alt = item.product?.images?.[0]?.altText || item.product?.title || 'Product image';
              return (
                <div key={item.id} className="flex items-center justify-between gap-3 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-md border bg-neutral-100">
                      <Image src={thumb} alt={alt} width={56} height={56} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-medium leading-5">{item.product.title}</h3>
                      <p className="text-sm text-gray-500">{item.variant.title}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(item.price.amount * item.quantity)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="my-4">
            <div className="flex gap-2">
              <input
                value={discountCode}
                onChange={(e)=>setDiscountCode(e.target.value)}
                placeholder="Discount code or gift card"
                className="w-full rounded-md border px-3 py-2"
              />
              <Button type="button" variant="secondary" onClick={applyDiscount}>Apply</Button>
            </div>
            {appliedDiscount ? (
              <p className="mt-2 text-sm text-green-700">Applied code: <span className="font-medium">{appliedDiscount.code}</span></p>
            ) : null}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(subtotal)}</span></div>
            {discountAmount > 0 ? (
              <div className="flex justify-between text-green-700"><span>Discount{appliedDiscount?.type==='percent' ? ` (${appliedDiscount.value}%)` : ''}</span><span>-{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(discountAmount)}</span></div>
            ) : null}
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

          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={paymentMethod === 'cod' ? handleCompleteOrder : handlePayNow}
            disabled={!isFormValid || submitting}
            title={!isFormValid ? 'Please complete required details to continue' : undefined}
          >
            {submitting
              ? paymentMethod === 'cod' ? 'Completing…' : 'Processing…'
              : paymentMethod === 'cod' ? 'Complete order' : 'Pay now'}
          </Button>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 p-4 shadow-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div className="">
            <p className="text-xs text-neutral-500">Total</p>
            <p className="text-base font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)}</p>
          </div>
          <Button
            size="lg"
            className="flex-1"
            onClick={paymentMethod === 'cod' ? handleCompleteOrder : handlePayNow}
            disabled={!isFormValid || submitting}
            title={!isFormValid ? 'Please complete required details to continue' : undefined}
          >
            {submitting
              ? paymentMethod === 'cod' ? 'Completing…' : 'Processing…'
              : paymentMethod === 'cod' ? 'Complete order' : 'Pay now'}
          </Button>
        </div>
      </div>
    </div>
  );
}
