// ====== CORE TYPES ======

export type Currency = 'USD' | 'PKR';

export interface Price {
  amount: number;
  currencyCode: Currency;
}

export interface Image {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface Option {
  id: string;
  name: string;
  values: string[];
}

export interface SelectedOption {
  name: string;
  value: string;
}

export type StockStatus = 'in_stock' | 'out_of_stock';
export type ProductStatus = 'active' | 'archived' | 'draft';

export interface Variant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: Price;
  inventoryQuantity: number;
  images?: Image[];
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  status: ProductStatus;
  collections: string[];
  availableForSale: boolean;
  price: Price;
  featuredImage: Image;
  images: Image[];
  options: Option[];
  variants: Variant[];
  inventory: {
    status: StockStatus;
    quantity: number;
  };
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
}

export interface Category {
  id: string;
  name: string;
  handle: string;
  description?: string;
  sortOrder?: number;
}

// ====== HELPER FUNCTIONS ======

export function createPrice(amount: number, currency: Currency = 'PKR'): Price {
  return { amount, currencyCode: currency };
}

export function createVariant(
  id: string,
  title: string,
  options: { name: string; value: string }[],
  price: number,
  quantity: number,
  overrides: Partial<Variant> = {}
): Variant {
  return {
    id,
    title,
    availableForSale: quantity > 0,
    selectedOptions: options.map(opt => ({
      name: opt.name,
      value: opt.value
    })),
    price: createPrice(price),
    inventoryQuantity: quantity,
    ...overrides
  };
}

// ====== SAMPLE DATA ======

// Sample variant data
const variant1 = createVariant(
  '1-38',
  '38',
  [
    { name: 'Size', value: '38' },
    { name: 'Color', value: 'White/Black' }
  ],
  5490,
  10,
  {
    images: [
      { url: '/images/paristan-jamm-1.jpg', altText: 'PARISTAN - JAMM - White/Black - 38' }
    ]
  }
);

// Sample product data
export const sampleProduct: Product = {
  id: '1',
  handle: 'paristan-jamm',
  title: 'PARISTAN - JAMM',
  description: 'Stylish and comfortable sneaker',
  status: 'active',
  collections: ['sneakers', 'bestsellers'],
  availableForSale: true,
  price: createPrice(5490),
  featuredImage: { url: '/images/paristan-jamm-1.jpg', altText: 'PARISTAN - JAMM' },
  images: [{ url: '/images/paristan-jamm-1.jpg', altText: 'PARISTAN - JAMM' }],
  options: [
    { id: 'size', name: 'Size', values: ['38', '39'] },
    { id: 'color', name: 'Color', values: ['White/Black'] }
  ],
  variants: [variant1],
  inventory: {
    status: 'in_stock',
    quantity: 10
  },
  featured: true,
  bestSeller: true,
  newArrival: false
};

// Sample categories
export const categories: Category[] = [
  { id: 'sneakers', name: 'Sneakers', handle: 'sneakers', sortOrder: 1 },
  { id: 'khussa', name: 'Khussa', handle: 'khussa', sortOrder: 2 },
  { id: 'new-arrivals', name: 'New Arrivals', handle: 'new-arrivals', sortOrder: 3 },
  { id: 'bestsellers', name: 'Bestsellers', handle: 'bestsellers', sortOrder: 4 }
];
