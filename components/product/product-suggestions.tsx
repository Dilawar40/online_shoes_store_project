"use client";

import { ProductCard } from './product-card';
import type { Product } from '@/types/ecommerce.types';

export function ProductSuggestions({ products }: { products: Product[] }) {
  if (!products || products.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export default ProductSuggestions;
