type BaseVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  price: {
    amount: string | number; // <-- changed
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string | number; // <-- changed
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
