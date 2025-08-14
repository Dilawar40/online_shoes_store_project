'use client';

import { useSearch } from '@/contexts/search-context';
import { ProductCardV2 } from '../product/product-card-v2';
import { useEffect } from 'react';

export function SearchResultsV2() {
  const {
    query,
    filters,
    sortBy,
    results: products,
    isLoading,
    facets,
    setSortBy,
    clearFilters,
    removeFilter
  } = useSearch();

  // Auto-close mobile filters when filters change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // Close mobile filters on desktop
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show no results message if no products found
  if (!isLoading && products.length === 0) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-medium text-gray-900 mb-2">No products found</h2>
        <p className="text-gray-500">
          {query ? `No products match "${query}"` : 'No products available'}
        </p>
        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Header with results count and sort */}
      <div className="border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{products.length}</span> results
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

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <div className="bg-gray-50 py-2 px-4 mb-6">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Filters:</span>
            {Object.entries(filters).map(([key, values]) =>
              values.map((value) => (
                <span
                  key={`${key}-${value}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {value}
                  <button
                    type="button"
                    className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                    onClick={() => removeFilter(key, value)}
                  >
                    <span className="sr-only">Remove filter</span>
                    <svg className="h-2 w-2" viewBox="0 0 8 8" fill="currentColor">
                      <path d="M8 0L0 8l1.5 1.5L8 3 14.5 9.5 16 8z" />
                    </svg>
                  </button>
                </span>
              ))
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="ml-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 16px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '24px',
            width: '100%'
          }}>
            {Array(8).fill(0).map((_, i) => (
              <div key={i} style={{
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  aspectRatio: '1',
                  backgroundColor: '#e0e0e0',
                  marginBottom: '8px'
                }}></div>
                <div style={{
                  height: '16px',
                  backgroundColor: '#e0e0e0',
                  marginBottom: '8px',
                  width: '75%',
                  borderRadius: '2px'
                }}></div>
                <div style={{
                  height: '16px',
                  backgroundColor: '#e0e0e0',
                  width: '50%',
                  borderRadius: '2px'
                }}></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '24px',
            width: '100%'
          }}>
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className="product-grid-item"
                style={{
                  position: 'relative',
                  transition: 'all 0.3s ease',
                }}
              >
                <ProductCardV2 
                  product={product}
                  priority={index < 4}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '64px 16px',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 500,
              color: '#000',
              marginBottom: '8px',
              lineHeight: '1.4'
            }}>No products found</h3>
            <p style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>We couldn't find any products matching your search</p>
            <button
              onClick={clearFilters}
              style={{
                padding: '12px 24px',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '2px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              className="clear-filters-btn"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
      <style jsx global>{`
        .product-grid-item:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .clear-filters-btn:hover {
          background-color: #333 !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
