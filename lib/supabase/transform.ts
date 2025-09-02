import { 
  Product as DBProduct, 
  ProductVariant as DBVariant,
  ProductImage as DBImage,
  ProductOption as DBOption,
  ProductOptionValue as DBOptionValue,
  Collection as DBCollection,
  HeroBanner as DBHeroBanner
} from './types';

// Transform database product to frontend product format
export function transformProduct(dbProduct: DBProduct) {
  const variants = (dbProduct.variants || []).map(variant => ({
    id: variant.id,
    title: variant.options?.map((opt: any) => opt?.value?.value ?? opt?.value ?? '').filter(Boolean).join(' / ') || '',
    availableForSale: (variant.quantity || 0) > 0,
    selectedOptions:
      (variant.options
        ?.map((opt: any) => ({
          name: opt?.option?.name ?? opt?.name ?? '',
          value: opt?.value?.value ?? opt?.value ?? ''
        }))
        .filter((o: any) => o.name && o.value)) || [],
    price: {
      amount: variant.price,
      currencyCode: dbProduct.currency_code || 'PKR'
    },
    compareAtPrice: variant.compare_at_price ? {
      amount: variant.compare_at_price,
      currencyCode: dbProduct.currency_code || 'PKR'
    } : undefined,
    sku: variant.sku || '',
    inventoryQuantity: variant.quantity || 0,
    featuredImage: {
      url: dbProduct.featured_image_url || '',
      altText: dbProduct.title,
      width: 800,
      height: 800
    }
  }));

  return {
    id: dbProduct.id,
    handle: dbProduct.handle,
    title: dbProduct.title,
    description: dbProduct.description || '',
    price: {
      amount: dbProduct.price,
      currencyCode: dbProduct.currency_code || 'PKR'
    },
    priceRange: (() => {
      const currency = dbProduct.currency_code || 'PKR';
      if (!variants.length) {
        return {
          minVariantPrice: { amount: dbProduct.price, currencyCode: currency },
          maxVariantPrice: { amount: dbProduct.compare_at_price || dbProduct.price, currencyCode: currency },
        };
      }
      const min = Math.min(...variants.map((v) => v.price.amount));
      const max = Math.max(...variants.map((v) => v.compareAtPrice?.amount || v.price.amount));
      return {
        minVariantPrice: { amount: min, currencyCode: currency },
        maxVariantPrice: { amount: max, currencyCode: currency },
      };
    })(),
    featuredImage: {
      url: dbProduct.featured_image_url || '',
      altText: dbProduct.title,
      width: 800,
      height: 800
    },
    images: (dbProduct.images || []).map(img => ({
      url: img.url,
      altText: img.alt_text || dbProduct.title,
      width: img.width || 800,
      height: img.height || 800
    })),
    options: (dbProduct.options || []).map(opt => ({
      id: opt.id,
      name: opt.name,
      values: opt.values?.map(v => v.value) || []
    })),
    variants,
    collections:
      (dbProduct.collections
        ?.map((c: any) => c?.collection?.handle || c?.handle)
        .filter(Boolean)) || [],
    inventory: {
      status: variants.some(v => v.inventoryQuantity > 0) ? 'in_stock' : 'out_of_stock',
      quantity: variants.reduce((sum, v) => sum + v.inventoryQuantity, 0)
    }
  };
}

// Transform database collection to frontend format
export function transformCollection(dbCollection: DBCollection) {
  return {
    id: dbCollection.id,
    handle: dbCollection.handle,
    title: dbCollection.title,
    description: dbCollection.description || '',
    image: dbCollection.image_url ? {
      url: dbCollection.image_url,
      altText: dbCollection.title,
      width: 800,
      height: 800
    } : null
  };
}

// Transform database hero banner to frontend format
export function transformHeroBanner(dbBanner: DBHeroBanner) {
  return {
    id: dbBanner.id,
    title: dbBanner.title,
    subtitle: dbBanner.subtitle || '',
    image: {
      url: dbBanner.image_url,
      altText: dbBanner.image_alt || dbBanner.title,
      width: 1920,
      height: 800
    },
    button: dbBanner.button_text && dbBanner.button_url ? {
      text: dbBanner.button_text,
      url: dbBanner.button_url
    } : null
  };
}
