'use server';

import { TAGS } from '@/app/lib/constants';
import { Product } from '@/app/lib/constants';
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// In-memory cart storage (replace with database in production)
let cart: {
  id: string;
  lines: Array<{
    id: string;
    merchandiseId: string;
    quantity: number;
    product: Product;
  }>;
  totalQuantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
} | null = null;

export async function addItem(
  prevState: any,
  selectedVariantId: string | undefined
) {
  if (!selectedVariantId) {
    return { error: 'No product selected' };
  }

  try {
    // In a real app, you would fetch the product details from your database
    // For now, we'll create a simplified product object
    const product: Product = {
      id: selectedVariantId || 'default-id',
      handle: 'sample-product',
      title: 'Sample Product',
      description: 'Sample product description',
      price: { amount: 0, currencyCode: 'PKR' },
      priceRange: {
        minVariantPrice: { amount: 0, currencyCode: 'PKR' },
        maxVariantPrice: { amount: 0, currencyCode: 'PKR' }
      },
      featuredImage: { url: '', altText: 'Sample product' },
      images: [],
      options: [],
      variants: [],
      collections: [],
      inventory: { status: 'in_stock', quantity: 1 }
    };

    // Initialize cart if it doesn't exist
    if (!cart) {
      cart = {
        id: 'local-cart-' + Date.now(),
        lines: [],
        totalQuantity: 0,
        cost: {
          totalAmount: {
            amount: '0',
            currencyCode: 'PKR'
          }
        }
      };
    }

    // Check if item already exists in cart
    const existingItem = cart.lines.find(line => line.merchandiseId === selectedVariantId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.lines.push({
        id: `line-${Date.now()}`,
        merchandiseId: selectedVariantId,
        quantity: 1,
        product
      });
    }

    // Update cart total
    cart.totalQuantity = cart.lines.reduce((sum, item) => sum + item.quantity, 0);
    
    revalidateTag(TAGS.cart);
    return { success: true };
  } catch (e) {
    console.error('Error adding to cart:', e);
    return { error: 'Error adding item to cart' };
  }
}

export async function removeItem(prevState: any, merchandiseId: string) {
  try {
    if (!cart) {
      return { error: 'Cart not found' };
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandiseId === merchandiseId
    );

    if (lineItem) {
      // Remove the item from cart
      cart.lines = cart.lines.filter(line => line.merchandiseId !== merchandiseId);
      
      // Update cart total
      cart.totalQuantity = cart.lines.reduce((sum, item) => sum + item.quantity, 0);
      
      revalidateTag(TAGS.cart);
      return { success: true };
    } else {
      return { error: 'Item not found in cart' };
    }
  } catch (e) {
    console.error('Error removing from cart:', e);
    return { error: 'Error removing item from cart' };
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    merchandiseId: string;
    quantity: number;
  }
) {
  const { merchandiseId, quantity } = payload;

  try {
    if (!cart) {
      return { error: 'Cart not found' };
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandiseId === merchandiseId
    );

    if (lineItem) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.lines = cart.lines.filter(line => line.merchandiseId !== merchandiseId);
      } else {
        // Update quantity
        lineItem.quantity = quantity;
      }
      
      // Update cart total
      cart.totalQuantity = cart.lines.reduce((sum, item) => sum + item.quantity, 0);
      
      revalidateTag(TAGS.cart);
      return { success: true };
    } else if (quantity > 0) {
      // If item doesn't exist and quantity > 0, add it
      return await addItem(prevState, merchandiseId);
    }

    revalidateTag(TAGS.cart);
    return { success: true };
  } catch (e) {
    console.error('Error updating cart:', e);
    return { error: 'Error updating item quantity' };
  }
}

export async function redirectToCheckout() {
  if (!cart) {
    throw new Error('Cannot proceed to checkout: Cart is empty');
  }
  
  // This will redirect the user to the checkout page
  redirect('/checkout');
}

export async function createCartAndSetCookie() {
  if (!cart) {
    cart = {
      id: 'local-cart-' + Date.now(),
      lines: [],
      totalQuantity: 0,
      cost: {
        totalAmount: {
          amount: '0',
          currencyCode: 'PKR'
        }
      }
    };
    
    // Set a cookie to persist the cart ID
    const cookieStore = cookies();
    // Using void operator to ignore the Promise return value
    void (async () => {
      const c = await cookieStore;
      c.set('cartId', cart!.id, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
    })();
  }
  
  return { success: true };
}

// Helper function to get the current cart
export async function getCart() {
  if (!cart) {
    await createCartAndSetCookie();
  }
  return cart;
}
