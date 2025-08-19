// app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Product } from '@/app/lib/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ----------------------
// PRODUCTS HELPERS
// ----------------------

// Fetch all products count
export async function getProductsCount() {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  return { count: count || 0, error };
}

// Fetch all categories count
export async function getCategoriesCount() {
  const { count, error } = await supabase
    .from('collections')
    .select('*', { count: 'exact', head: true });

  return { count: count || 0, error };
}

// ----------------------
// CART HELPERS
// ----------------------

type ProductVariant = {
  id: string;
  title: string;
  price: { amount: number; currencyCode: string };
  selectedOptions?: Array<{ name: string; value: string }>;
};

// Ensure user has a cart (returns cart_id)
export async function getOrCreateCart(userId: string) {
  // Try existing cart
  const { data: existingCart, error } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existingCart) return existingCart.id;

  // Create new cart
  const { data: newCart, error: insertError } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select()
    .single();

  if (insertError) throw insertError;
  return newCart.id;
}

// Fetch cart items for a user
export async function getCartItems(userId: string) {
  const cartId = await getOrCreateCart(userId);

  const { data: items, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId);

  if (error) throw error;
  return { cartId, items };
}

// Add new item into cart
export async function addItemToCart(
  userId: string,
  variant: ProductVariant,
  product: Product
) {
  const cartId = await getOrCreateCart(userId);

  const { error } = await supabase.from('cart_items').insert({
    cart_id: cartId,
    variant_id: variant.id,
    product,
    variant,
    quantity: 1,
    price: variant.price,
  });

  if (error) throw error;
}

// Update existing cart item
export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
) {
  if (quantity <= 0) {
    await supabase.from('cart_items').delete().eq('id', itemId);
  } else {
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
  }
}

// Delete item from cart
export async function deleteCartItem(itemId: string) {
  await supabase.from('cart_items').delete().eq('id', itemId);
}

// Subscribe to real-time cart changes
export function subscribeToCart(cartId: string, callback: () => void) {
  return supabase
    .channel('cart-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'cart_items', filter: `cart_id=eq.${cartId}` },
      callback
    )
    .subscribe();
}
