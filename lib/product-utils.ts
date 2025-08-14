import { Product as StaticProduct, Variant as StaticVariant } from '@/app/lib/constants';
import { Product, ProductVariant } from '@/types/product.types';

export function transformStaticProduct(staticProduct: StaticProduct): Product {
  // Transform price to ensure amount is a number
  const transformPrice = (price: { amount: number; currencyCode: string }) => ({
    amount: Number(price.amount) || 0,
    currencyCode: price.currencyCode || 'PKR',
  });

  // Transform variants
  const variants: ProductVariant[] = (staticProduct.variants as StaticVariant[]).map(variant => ({
    ...variant,
    price: transformPrice(variant.price),
    compareAtPrice: variant.compareAtPrice ? transformPrice(variant.compareAtPrice) : undefined,
    selectedOptions: variant.selectedOptions || [],
    availableForSale: variant.availableForSale ?? true,
    featuredImage: variant.featuredImage || {
      url: variant.image?.url || '',
      altText: variant.image?.altText || staticProduct.title,
      width: variant.image?.width,
      height: variant.image?.height,
    },
  }));

  // Transform the main product
  const transformedProduct: Product = {
    ...staticProduct,
    // Ensure price is in the correct format
    price: transformPrice(staticProduct.price),
    // Ensure priceRange is in the correct format
    priceRange: {
      minVariantPrice: transformPrice(staticProduct.priceRange.minVariantPrice),
      maxVariantPrice: transformPrice(staticProduct.priceRange.maxVariantPrice),
    },
    variants,
    // Add missing properties with defaults
    availableForSale: staticProduct.availableForSale ?? true,
    status: 'active',
    tags: 'tags' in staticProduct ? staticProduct.tags || [] : [],
    // Transform collections from string[] to {id, handle, title}[] if needed
    collections: Array.isArray(staticProduct.collections) 
      ? staticProduct.collections.map((col: string | { id: string; handle: string; title: string }) => 
          typeof col === 'string' ? { id: col, handle: col.toLowerCase().replace(/\s+/g, '-'), title: col } : col
        )
      : [],
    // Add featured image if missing
    featuredImage: staticProduct.featuredImage || 
      (variants[0]?.image ? {
        url: variants[0].image.url,
        altText: variants[0].image.altText || staticProduct.title,
        width: variants[0].image.width,
        height: variants[0].image.height,
      } : {
        url: '/placeholder-product.jpg',
        altText: staticProduct.title,
        width: 600,
        height: 600,
      }),
  };

  return transformedProduct;
}

export function transformStaticProducts(staticProducts: StaticProduct[]): Product[] {
  return staticProducts.map(transformStaticProduct);
}
