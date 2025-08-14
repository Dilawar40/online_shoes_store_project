export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  currency_code: string;
  status: 'active' | 'draft' | 'archived';
  featured_image_url: string | null;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  options?: ProductOption[];
  collections?: {
    collection: Collection;
  }[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
}

export interface ProductOption {
  id: string;
  product_id: string;
  name: string;
  sort_order: number;
  values?: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: string;
  option_id: string;
  value: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  quantity: number;
  barcode: string | null;
  weight: number | null;
  weight_unit: string;
  options?: {
    option: ProductOption;
    value: ProductOptionValue;
  }[];
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  image_alt: string | null;
  button_text: string | null;
  button_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
