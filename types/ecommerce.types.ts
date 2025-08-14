// Generic E-commerce Types
export type Maybe<T> = T | null;

export type Connection<T> = {
  edges: Array<Edge<T>>;
  pageInfo?: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type Edge<T> = {
  node: T;
  cursor?: string;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: CartItem[];
  totalQuantity: number;
};

export type Product = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: ProductVariant[];
  featuredImage: Image;
  images: Image[];
  seo: SEO;
  tags: string[];
  updatedAt: string;
};

export type CartItem = {
  id: string;
  quantity: number;
  price: {
    amount: number;
    currencyCode: string;
  };
  variant: ProductVariant;
  product: Product; // This should contain all product data
  cost?: {
    totalAmount: {
      amount: number;
      currencyCode: string;
    };
  };
  merchandise?: any;
};
export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
  path: string;
  products?: Connection<Product>;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Menu = {
  title: string;
  path: string;
  items?: MenuItem[];
};

export type MenuItem = {
  title: string;
  url: string;
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
  compareAtPrice?: Money;
  sku?: string;
  image?: Image;
};

export type SEO = {
  title: string;
  description: string;
};

// API Operation Types
export type CartOperation = {
  data: { cart: Cart };
  variables: { cartId: string };
};

export type CreateCartOperation = {
  data: { cartCreate: { cart: Cart } };
};

export type AddToCartOperation = {
  data: { cartLinesAdd: { cart: Cart } };
  variables: {
    cartId: string;
    lines: {
      merchandiseId: string;
      quantity: number;
    }[];
  };
};

export type RemoveFromCartOperation = {
  data: { cartLinesRemove: { cart: Cart } };
  variables: {
    cartId: string;
    lineIds: string[];
  };
};

export type UpdateCartOperation = {
  data: { cartLinesUpdate: { cart: Cart } };
  variables: {
    cartId: string;
    lines: {
      id: string;
      quantity: number;
    }[];
  };
};

export type CollectionOperation = {
  data: { collection: Collection };
  variables: { handle: string };
};

export type CollectionProductsOperation = {
  data: { collection: { products: Connection<Product> } };
  variables: {
    handle: string;
    reverse?: boolean;
    sortKey?: string;
    first?: number;
    after?: string;
  };
};

export type CollectionsOperation = {
  data: { collections: Connection<Collection> };
  variables?: {
    first?: number;
    after?: string;
  };
};

export type MenuOperation = {
  data: { menu?: { items: MenuItem[] } };
  variables: { handle: string };
};

export type PageOperation = {
  data: { page: Page };
  variables: { handle: string };
};

export type PagesOperation = {
  data: { pages: Connection<Page> };
  variables?: {
    first?: number;
    after?: string;
  };
};

export type ProductOperation = {
  data: { product: Product };
  variables: { handle: string };
};

export type ProductRecommendationsOperation = {
  data: { productRecommendations: Product[] };
  variables: { productId: string };
};

export type ProductsOperation = {
  data: { products: Connection<Product> };
  variables?: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
    first?: number;
    after?: string;
  };
};

// Helper types for UI
export type SelectedOptions = Record<string, string>;

export type Combination = {
  id: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
  compareAtPrice?: Money;
};

export type Option = {
  name: string;
  values: string[];
};
