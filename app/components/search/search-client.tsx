'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductCard from './product-card';
import { Product } from '@/app/lib/constants';

interface SearchClientProps {
  initialProducts: Product[];
  sortOption: {
    slug: string | null;
    sortKey: string;
    reverse: boolean;
    title: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function SearchClient({ 
  initialProducts, 
  sortOption,
  searchParams 
}: SearchClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = searchParams?.q as string || '';

  // Update products when initialProducts changes (from server)
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const current = new URLSearchParams(Array.from(params.entries()));
    
    if (newSort) {
      current.set('sort', newSort);
    } else {
      current.delete('sort');
    }
    
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
        <p className="text-gray-600 mb-6">
          {query ? (
            `No products found for "${query}". Try adjusting your search.`
          ) : (
            'No products available in this collection.'
          )}
        </p>
        <Link
          href="/search"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {query ? `Search results for "${query}"` : 'All Products'}
          </h1>
          <p className="text-gray-600">{products.length} products found</p>
        </div>
        
        <div className="flex items-center">
          <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort"
            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            value={sortOption.slug ?? 'featured'}
            onChange={handleSortChange}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
            <option value="bestselling">Best Selling</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 -mx-2">
        {products.map((product) => (
          <div key={product.handle} className="px-2">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
