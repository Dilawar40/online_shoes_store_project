export interface Product {
  id: string;
  name: string;
  handle: string;
  title: string;
  price: {
    amount: number;
    currency: string;
  };
  stock: {
    status: string;
    details: string;
    size_note: string;
  };
  sizes: number[];
  color: string;
  quantity: number;
  delivery_timeline: {
    ordered: string;
    order_ready: {
      start: string;
      end: string;
    };
    delivered: {
      start: string;
      end: string;
    };
    order_note: string;
  };
  payment_methods: string[];
  featuredImage: {
    url: string;
  };
  priceRange: {
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface GalleryImage {
  src: string;
  altText: string;
}
