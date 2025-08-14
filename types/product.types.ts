// Base variant type that matches the static data structure
type BaseVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  price: {
    amount: number;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: number;
    currencyCode: string;
  };
  sku?: string;
  inventoryQuantity: number;
  featuredImage: {
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
};

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  price: {
    amount: number;
    currencyCode: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: number;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: number;
      currencyCode: string;
    };
  };
  featuredImage: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
  images?: Array<{
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  }>;
  variants: BaseVariant[];
  options?: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
  tags?: string[];
  collections?: Array<{
    id: string;
    handle: string;
    title: string;
  }>;
  availableForSale?: boolean;
  status?: 'active' | 'draft' | 'archived' | 'new';
  createdAt?: string;
  updatedAt?: string;
  seo?: {
    title?: string;
    description?: string;
  };
  options?: {
    id: string;
    name: string;
    values: string[];
  }[];
  compareAtPrice?: {
    amount: string | number;
    currencyCode: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: string | number;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string | number;
      currencyCode: string;
    };
  };
  images?: Array<{
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  }>;
  featuredImage: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
  descriptionHtml?: string;
  seo?: {
    title?: string;
    description?: string;
  };
  collections?: Array<{
    id: string;
    handle: string;
    title: string;
  }>;
}

export type ProductVariant = BaseVariant & {
  compareAtPrice?: {
    amount: number;
    currencyCode: string;
  };
  image?: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
};
