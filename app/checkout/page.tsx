'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type CartItem = {
  id: string;
  product: {
    title: string;
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
  const router = useRouter();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      
      <div className="grid gap-8 md:grid-cols-3">
        {/* Order Summary */}
        <div className="md:col-span-2">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="font-medium">{item.product.title}</h3>
                    <p className="text-sm text-gray-500">{item.variant.title}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: item.price.currencyCode || 'PKR',
                    }).format(item.price.amount * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Total */}
        <div className="h-fit rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">Order Total</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: cart.items[0]?.price.currencyCode || 'PKR',
                }).format(
                  cart.items.reduce(
                    (sum, item) => sum + item.price.amount * item.quantity,
                    0
                  )
                )}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: cart.items[0]?.price.currencyCode || 'PKR',
                  }).format(
                    cart.items.reduce(
                      (sum, item) => sum + item.price.amount * item.quantity,
                      0
                    )
                  )}
                </span>
              </div>
            </div>
            <Button className="w-full" size="lg">
              Proceed to Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
