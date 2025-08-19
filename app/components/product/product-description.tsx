import { VariantSelector } from "./variant-selector";
import Price from "../Price";
import Prose from "../prose";
import { Product } from "@/types/ecommerce.types";
import { AddToCart } from "../cart/add-to-cart";

interface ApiProduct {
  id: string;
  title: string;
  description: string;
  price_amount: number;
  price_currency: string;
  min_price_amount: number;
  max_price_amount: number;
  featured_image: {
    url: string;
    altText: string;
  };
  images: Array<{
    url: string;
    altText: string;
  }>;
  options: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
  variants: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    options: Array<{
      name: string;
      value: string;
    }>;
  }>;
  inventory_status: string;
  inventory_quantity: number;
  status: string;
  created_at: string;
  updated_at: string;
  collections?: any;
}

export interface ProductDescriptionProps {
  product: ApiProduct;
}

// Import types
import type { Product as ProductType } from '@/app/lib/constants';
import type { ProductVariant } from '@/types/ecommerce.types';

// Helper function to transform the API product to match the Product type from constants.ts
function transformProduct(apiProduct: ApiProduct): ProductType {
  // Create a default image with required dimensions
  const createImage = (img: { url: string; altText?: string }) => ({
    url: img.url,
    altText: img.altText || apiProduct.title,
    width: 500, // Default width
    height: 500, // Default height
  });

  // First, transform variants to ProductVariant[] for VariantSelector
  const productVariants: ProductVariant[] = (apiProduct.variants || []).map(variant => ({
    id: variant.id,
    name: variant.name || variant.id,
    price: variant.price,
    stock: variant.stock || 0,
    options: variant.options || [],
    priceObject: {
      amount: variant.price.toString(),
      currencyCode: apiProduct.price_currency || 'PKR',
    },
    availableForSale: variant.stock > 0,
    selectedOptions: variant.options || [],
    inventoryQuantity: variant.stock || 0,
    featuredImage: {
      url: apiProduct.featured_image?.url || '',
      altText: apiProduct.featured_image?.altText || variant.name || '',
    },
  }));

  // Then create Variant[] for the Product type with all required fields
  const variants = productVariants.map(variant => ({
    id: variant.id,
    title: variant.name,
    availableForSale: variant.availableForSale || false,
    selectedOptions: variant.selectedOptions || [],
    price: {
      amount: variant.price,
      currencyCode: apiProduct.price_currency || 'PKR',
    },
    sku: variant.id,
    inventoryQuantity: variant.inventoryQuantity || 0, // Ensure it's always a number
    featuredImage: {
      url: variant.featuredImage?.url || '',
      altText: variant.featuredImage?.altText || '',
      width: 800,
      height: 800,
    },
    // Ensure all required Variant fields are present
    compareAtPrice: undefined,
    image: {
      url: variant.featuredImage?.url || '',
      altText: variant.featuredImage?.altText || '',
      width: 800,
      height: 800,
    }
  }));

  // Create the product object that matches the Product type from constants.ts
  const product: ProductType = {
    id: apiProduct.id,
    handle: apiProduct.title.toLowerCase().replace(/\s+/g, '-'),
    title: apiProduct.title,
    description: apiProduct.description,
    price: {
      amount: apiProduct.price_amount,
      currencyCode: apiProduct.price_currency || 'PKR',
    },
    priceRange: {
      minVariantPrice: {
        amount: apiProduct.min_price_amount,
        currencyCode: apiProduct.price_currency || 'PKR',
      },
      maxVariantPrice: {
        amount: apiProduct.max_price_amount,
        currencyCode: apiProduct.price_currency || 'PKR',
      },
    },
    featuredImage: createImage({
      url: apiProduct.featured_image?.url || '',
      altText: apiProduct.featured_image?.altText || apiProduct.title,
    }),
    images: apiProduct.images?.map(img => createImage(img)) || [],
    options: (apiProduct.options || []).map(opt => ({
      id: opt.id,
      name: opt.name,
      values: opt.values || [],
    })),
    variants,
    collections: Array.isArray(apiProduct.collections) ? apiProduct.collections : [],
    inventory: {
      status: (apiProduct.inventory_status as 'in_stock' | 'out_of_stock') || 'out_of_stock',
      quantity: apiProduct.inventory_quantity || 0,
    },
  };

  return product;
}

export function ProductDescription({ product: apiProduct }: ProductDescriptionProps) {
  // Transform the API product to match the Product type
  const product = transformProduct(apiProduct);

  return (
    <>
      {/* Product Title & Price */}
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
        <div className="mr-auto w-auto rounded-full bg-blue-600 px-4 py-2 text-sm text-white shadow-md">
          <Price
            amount={product.priceRange.maxVariantPrice.amount}
            currencyCode={product.priceRange.maxVariantPrice.currencyCode}
          />
        </div>
      </div>

      {/* Variant Selector */}
      <VariantSelector
        options={apiProduct.options.map(option => ({
          ...option,
          // If this is a size option with a single value containing slashes, split it into multiple values
          values: (option.name.toLowerCase() === 'size' || option.name.toLowerCase() === 'sizes') && 
                 option.values.length === 1 && 
                 option.values[0].includes('/')
            ? option.values[0].split('/').map((v: string) => v.trim())
            : option.values
        }))}
        variants={product.variants}
      />

      {/* Product Description */}
      {product.description ? (
        <Prose
          className="mb-6 text-sm leading-tight dark:text-white/[60%]"
          html={product.description}
        />
      ) : null}

      {/* Add to Cart (enable later if needed) */}
      <AddToCart product={product} />
    </>
  );
}
