// TYPES
export type Currency = 'PKR';

export type Price = {
  amount: number;
  currencyCode: string;
};

export interface Image {
  url: string;
  altText: string;
  width: number;
  height: number;
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
export type ProductStatus = 'active';

export interface Variant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: Price;
  compareAtPrice?: Price;
  sku?: string;
  inventoryQuantity: number;
  featuredImage: Image;
  image?: Image;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: Price;
  priceRange: { minVariantPrice: Price; maxVariantPrice: Price };
  featuredImage: Image;
  images: Image[];
  options: Option[];
  variants: Variant[];
  collections: string[];
  inventory: { status: StockStatus; quantity: number };
}

export interface Collection {
  id: string;
  sortOrder: number;
  handle: string;
  title: string;
  description: string;
  products: string[];
}

// MOCK DATA
const createPrice = (amount: number): Price => ({
  amount: amount,
  currencyCode: 'PKR'
});

const createVariant = (
  id: string,
  title: string,
  options: SelectedOption[],
  price: number,
  quantity: number
): Variant => ({
  id,
  title,
  sku: `sku-${id}`,
  availableForSale: quantity > 0,
  selectedOptions: options,
  price: createPrice(price),
  inventoryQuantity: quantity,
  featuredImage: { url: '/images/placeholder.jpg', altText: title, width: 800, height: 800 }
});


export const staticProducts: Product[] = [
  // Product 1
  {
    id: '1',
    handle: 'paristan-jamm',
    title: 'PARISTAN - JAMM',
    description: 'Premium quality PARISTAN shoes in JAMM color. Limited stock.',
    price: createPrice(6490),
    priceRange: { minVariantPrice: createPrice(6490), maxVariantPrice: createPrice(6490) },
    featuredImage: { url: '/images/stylo1.jpg', altText: 'PARISTAN - JAMM', width: 800, height: 800 },
    images: [
      { url: '/images/Stylo1.jpg', altText: 'Front View', width: 800, height: 800 },
      { url: '/images/Stylo3.jpg', altText: 'Side View', width: 800, height: 800 },
      { url: '/images/Stylo4.jpg', altText: 'Detail View', width: 800, height: 800 }
    ],
    options: [
      { id: 'size', name: 'Size', values: ['36', '38', '39', '40', '41'] },
      { id: 'color', name: 'Color', values: ['JAMM'] }
    ],
    variants: [
      createVariant('1-36', 'PARISTAN - JAMM / 36', [{ name: 'Size', value: '36' }, { name: 'Color', value: 'JAMM' }], 6490, 1)
    ],
    collections: ['all', 'khussa'],
    inventory: { status: 'in_stock', quantity: 1 }
  },

  // Product 2
  {
    id: '2',
    handle: 'royal-blue-khussa',
    title: 'ROYAL BLUE KHUSSA',
    description: 'Hand-stitched khussa in rich royal-blue velvet with mirror work.',
    price: createPrice(5490),
    priceRange: { minVariantPrice: createPrice(5490), maxVariantPrice: createPrice(5490) },
    featuredImage: { url: '/images/Stylo32.jpg', altText: 'ROYAL BLUE KHUSSA', width: 800, height: 800 },
    images: [
      { url: '/images/Stylo1.jpg', altText: 'Front View', width: 800, height: 800 },
      { url: '/images/Stylo1.jpg', altText: 'Side View', width: 800, height: 800 }
    ],
    options: [
      { id: 'size', name: 'Size', values: ['37', '38', '39', '40'] },
      { id: 'color', name: 'Color', values: ['Royal Blue'] }
    ],
    variants: [
      createVariant('2-37', 'ROYAL BLUE KHUSSA / 37', [{ name: 'Size', value: '37' }, { name: 'Color', value: 'Royal Blue' }], 5490, 5)
    ],
    collections: ['all', 'khussa'],
    inventory: { status: 'in_stock', quantity: 5 }
  },

  // Product 3
  {
    id: '3',
    handle: 'golden-thread-khussa',
    title: 'GOLDEN THREAD KHUSSA',
    description: 'Elegant khussa embellished with intricate golden thread embroidery.',
    price: createPrice(7290),
    priceRange: { minVariantPrice: createPrice(7290), maxVariantPrice: createPrice(7290) },
    featuredImage: { url: '/images/Stylo1.jpg', altText: 'GOLDEN THREAD KHUSSA', width: 800, height: 800 },
    images: [
      { url: '/images/Stylo1.jpg', altText: 'Front View', width: 800, height: 800 },
      { url: '/images/Stylo1.jpg', altText: 'Detail View', width: 800, height: 800 }
    ],
    options: [
      { id: 'size', name: 'Size', values: ['36', '37', '38', '39', '40', '41'] },
      { id: 'color', name: 'Color', values: ['Gold on Cream'] }
    ],
    variants: [
      createVariant('3-38', 'GOLDEN THREAD KHUSSA / 38', [{ name: 'Size', value: '38' }, { name: 'Color', value: 'Gold on Cream' }], 7290, 3)
    ],
    collections: ['all', 'khussa'],
    inventory: { status: 'in_stock', quantity: 3 }
  }
];

export const staticCollections: Collection[] = [
  {
    id: '1',
    sortOrder: 1,
    handle: 'all',
    title: 'All',
    description: 'All products',
    products: ['1']
  },
  {
    id: '2',
    sortOrder: 2,
    handle: 'khussa',
    title: 'khussa',
    description: 'Traditional',
    products: ['1']
  }
];
export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: 'RELEVANCE' | 'BEST_SELLING' | 'CREATED_AT' | 'PRICE';
  reverse: boolean;
};


export const defaultSort: SortFilterItem = {
  title: 'Relevance',
  slug: null,
  sortKey: 'RELEVANCE',
  reverse: false
};
export const sorting: SortFilterItem[] = [
  defaultSort,
  { title: 'Trending', slug: 'trending-desc', sortKey: 'BEST_SELLING', reverse: false }, // asc
  { title: 'Latest arrivals', slug: 'latest-desc', sortKey: 'CREATED_AT', reverse: true },
  { title: 'Price: Low to high', slug: 'price-asc', sortKey: 'PRICE', reverse: false }, // asc
  { title: 'Price: High to low', slug: 'price-desc', sortKey: 'PRICE', reverse: true }
];

// FETCHERS
export async function getCollection(handle: string): Promise<Collection> {
  const collection = staticCollections.find(c => c.handle === handle);
  if (!collection) throw new Error('Collection not found');
  return collection;
}
export const TAGS = {
  collections: 'collections',
  products: 'products',
  cart: 'cart'
};

export interface GetCollectionProductsParams {
  collection?: string;
  sortKey?: SortFilterItem['sortKey'];
  reverse?: boolean;
}

export async function getCollectionProducts({
  collection,
  sortKey,
  reverse = false
}: GetCollectionProductsParams = {}): Promise<Product[]> {
  let products = collection
    ? staticProducts.filter(p => p.collections.includes(collection))
    : staticProducts;

  // Example sorting (optional)
  if (sortKey) {
    products = [...products].sort((a, b) => {
      switch (sortKey) {
        case 'PRICE':
          const aPrice = a.price.amount;
          const bPrice = b.price.amount;
          return reverse ? bPrice - aPrice : aPrice - bPrice;
        case 'CREATED_AT':
          return reverse ? -1 : 1; // Mock sort
        default:
          return 0;
      }
    });
  }

  return products;
}