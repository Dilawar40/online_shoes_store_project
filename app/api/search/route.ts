import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const collection = searchParams.get('collection') || '';
  const sortKey = searchParams.get('sortKey') || 'created_at';
  const reverse = searchParams.get('reverse') === 'true';

  try {
    // Base query
    let queryBuilder = supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq('status', 'active');

    // Apply search query if provided
    if (query) {
      queryBuilder = queryBuilder.ilike('title', `%${query}%`);
    }

    // Apply collection filter if provided
    if (collection && collection !== 'all') {
      queryBuilder = queryBuilder.contains('collections', [collection]);
    }

    // Apply sorting
    switch (sortKey) {
      case 'PRICE':
        queryBuilder = queryBuilder.order('price_amount', { ascending: !reverse });
        break;
      case 'CREATED_AT':
        queryBuilder = queryBuilder.order('created_at', { ascending: !reverse });
        break;
      default:
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
    }

    const { data: products, error } = await queryBuilder;

    if (error) throw error;

    // Transform the data to match the expected format
    const transformedProducts = products.map((product: any) => ({
      id: product.id,
      handle: product.handle || `product-${product.id}`,
      title: product.title,
      description: product.description,
      price: {
        amount: product.price_amount,
        currencyCode: product.price_currency || 'PKR',
      },
      priceRange: {
        minVariantPrice: {
          amount: product.min_price_amount || product.price_amount,
          currencyCode: product.price_currency || 'PKR',
        },
        maxVariantPrice: {
          amount: product.max_price_amount || product.price_amount,
          currencyCode: product.price_currency || 'PKR',
        },
      },
      featuredImage: {
        url: product.featured_image?.url || '/placeholder-product.jpg',
        altText: product.featured_image?.alt_text || product.title,
        width: 800,
        height: 800,
      },
      images: (product.images || []).map((img: any) => ({
        url: img.url,
        altText: img.alt_text || product.title,
        width: 800,
        height: 800,
      })),
      variants: (product.variants || []).map((v: any) => ({
        id: v.id,
        title: v.name || 'Default',
        price: {
          amount: v.price || product.price_amount,
          currencyCode: product.price_currency || 'PKR',
        },
        compareAtPrice: v.compare_at_price ? {
          amount: v.compare_at_price,
          currencyCode: product.price_currency || 'PKR',
        } : undefined,
        inventoryQuantity: v.stock || 0,
        availableForSale: (v.stock || 0) > 0,
        selectedOptions: [],
        featuredImage: {
          url: v.image_url || product.featured_image?.url || '/placeholder-product.jpg',
          altText: product.title,
          width: 800,
          height: 800,
        },
      })),
      options: [],
      collections: product.collections || [],
      inventory: {
        status: (product.inventory_quantity || 0) > 0 ? 'in_stock' : 'out_of_stock',
        quantity: product.inventory_quantity || 0,
      },
    }));

    return NextResponse.json(transformedProducts);
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search products' },
      { status: 500 }
    );
  }
}
