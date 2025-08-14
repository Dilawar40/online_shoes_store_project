import { supabase } from '../supabase';

// Fetch all active products with their variants and images
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      variants:product_variants(*, 
        options:variant_options(*, 
          option:product_options(*),
          value:product_option_values(*)
        )
      ),
      collections:collection_products(collection:collections(*))
    `)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
}

// Fetch a single product by handle
export async function getProductByHandle(handle: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      variants:product_variants(*, 
        options:variant_options(*, 
          option:product_options(*),
          value:product_option_values(*)
        )
      ),
      options:product_options(*, values:product_option_values(*)),
      collections:collection_products(collection:collections(*))
    `)
    .eq('handle', handle)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data;
}

// Fetch all collections
export async function getCollections() {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
  return data;
}

// Fetch products by collection
export async function getProductsByCollection(collectionHandle: string) {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      products:collection_products(
        product:products(
          *,
          images:product_images(*),
          variants:product_variants(*)
        )
      )
    `)
    .eq('handle', collectionHandle)
    .single();

  if (error) {
    console.error('Error fetching collection products:', error);
    return null;
  }
  return data;
}

// Fetch hero banners
export async function getHeroBanners() {
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching hero banners:', error);
    return [];
  }
  return data;
}
