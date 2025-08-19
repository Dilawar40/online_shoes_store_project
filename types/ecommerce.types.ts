// types.ts

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  // Add any other cart item specific fields you need
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface Price {
  amount: number;
  currencyCode: string;
}

export interface PriceRange {
  minVariantPrice: Price;
  maxVariantPrice: Price;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  options: Array<{
    name: string;
    value: string;
  }>;
  // Transformed fields
  priceObject?: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  };
  // For backward compatibility
  availableForSale?: boolean;
  selectedOptions?: Array<{
    name: string;
    value: string;
  }>;
  inventoryQuantity?: number;
  featuredImage?: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
  image?: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: Price;
  priceRange: PriceRange;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  images?: {
    url: string;
    altText?: string;
  }[];
  options?: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
  variants: ProductVariant[]; // Array of product variants
  collections?: any[]; // For backward compatibility
  inventory?: {
    total: number;
  };
}
