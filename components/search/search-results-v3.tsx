import { useSearch } from '@/contexts/search-context';
import dynamic from 'next/dynamic';
import { Product } from '@/types/product.types';

// Dynamically import ProductCardV3 with no SSR to avoid hydration issues
const ProductCardV3 = dynamic(
  () => import('@/components/product/product-card-v3'),
  { ssr: false }
);

interface SearchResultsV3Props {
  query?: string;
}

export default function SearchResultsV3({ query = '' }: SearchResultsV3Props) {
  const { 
    results: products = [], 
    isLoading, 
    sortBy,
    setSortBy,
    clearFilters,
    filters
  } = useSearch();

  return (
    <div className="bg-white">
      {/* Results Header */}
      <div className="border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{products.length}</span> results
              {query && ` for "${query}"`}
            </p>
            <div className="mt-2 sm:mt-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(8).fill(0).map((_, i) => (
              <div 
                key={`skeleton-${i}`}
                className="animate-pulse bg-gray-100 rounded-md overflow-hidden"
                style={{
                  aspectRatio: '1/1.3',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div className="flex-1 bg-gray-200"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            // Product grid
            products.map((product: Product) => (
              <ProductCardV3
                key={product.id}
                product={product}
                priority={product.id === products[0]?.id}
                className="w-full h-full transition-all duration-300 hover:shadow-md"
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <h3 className="text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              {Object.keys(filters || {}).length > 0 && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
