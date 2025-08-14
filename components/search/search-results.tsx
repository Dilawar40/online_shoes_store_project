'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearch } from '@/contexts/search-context';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../product/product-card';
import { Product } from '@/types/product.types';

type FacetType = 'size' | 'color' | 'category' | 'price' | 'availability';
type FiltersState = Partial<Record<FacetType, string[]>>;

export function SearchResults() {
  const searchContext = useSearch();
  // Define default context values with proper types
  const defaultContext = {
    query: '',
    filters: {} as Record<string, string[]>,
    setFilters: (() => {}) as (filters: Record<string, string[]>) => void,
    sortBy: 'featured',
    setSortBy: (() => {}) as (sortBy: string) => void,
    results: [] as Product[],
    facets: {} as Record<FacetType, { name: string; values: string[] }>,
    isLoading: false,
    clearFilters: () => {},
    removeFilter: (() => {}) as (facet: string, value: string) => void
  };

  // Merge with actual context or use defaults
  const {
    query,
    filters,
    setFilters: setFiltersState,
    sortBy,
    setSortBy,
    results: products,
    facets,
    isLoading,
    clearFilters,
    removeFilter
  } = { ...defaultContext, ...searchContext };

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [activeFacet, setActiveFacet] = useState<FacetType | null>(null);

  // Handle clearing all filters
  const clearAllFilters = () => {
    if (clearFilters) clearFilters();
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setIsMobileFiltersOpen(prev => !prev);
  };

  // Define renderResults function
  const renderResults = () => {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  // Render active filters
  const renderActiveFilters = () => {
    const activeFilters = Object.entries(filters || {}).flatMap(
      ([key, values]) =>
        (Array.isArray(values) ? values : []).map((value) => ({
          key: `${key}-${value}`,
          name: value,
          onRemove: () => removeFilter(key, value),
        })) || []
    );

    if (activeFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 mt-2">
        {activeFilters.map((filter) => (
          <span
            key={filter.key}
            className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800"
          >
            {filter.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                filter.onRemove();
              }}
              className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500"
            >
              <span className="sr-only">Remove filter</span>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Clear all
        </button>
      </div>
    );
  };

  // Type guard for facet value items
  const isFacetValueObject = (item: any): item is { value: string; count?: number } => {
    return item && typeof item === 'object' && 'value' in item && typeof item.value === 'string';
  };

  // Render facet values
  const renderFacetValues = (facetName: FacetType) => {
    const facet = facets[facetName];
    if (!facet) return null;

    let values: string[] = [];
    
    try {
      // Get the facet values - they should be an array of { value: string; count: number }
      const facetValues = Array.isArray(facet) ? facet : [];
      
      // Map the facet values to strings
      values = facetValues
        .map(item => item?.value || '')
        .filter(Boolean);
        
    } catch (error) {
      console.error(`Error processing ${facetName} facet values:`, error);
      return null;
    }

    if (!values.length) return null;

    return (
      <div className="space-y-2 mt-2">
        {values.map((value) => (
          <div key={value} className="flex items-center">
            <input
              id={`${facetName}-${value}`}
              name={`${facetName}[]`}
              type="checkbox"
              checked={isFilterActive(facetName, value)}
              onChange={() => handleFilterItemClick(facetName, value)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor={`${facetName}-${value}`}
              className="ml-3 text-sm text-gray-600"
            >
              {value}
            </label>
          </div>
        ))}
      </div>
    );
  };

  // Handle filter toggle with proper type safety
  const toggleFilter = useCallback((facetName: FacetType, value: string) => {
    // Use a type assertion to ensure TypeScript understands the setState callback
    const updateFn = (prevFilters: Record<string, string[]>) => {
      // Create a new array for the current facet's filters
      const currentFilters = [...(prevFilters[facetName] || [])];
      const valueIndex = currentFilters.indexOf(value);
      
      // Toggle the filter value
      if (valueIndex >= 0) {
        currentFilters.splice(valueIndex, 1);
      } else {
        currentFilters.push(value);
      }

      // Return a new filters object with the updated values
      return {
        ...prevFilters,
        [facetName]: currentFilters
      };
    };
    
    // Call setFiltersState with the update function
    setFiltersState(updateFn as unknown as Record<string, string[]>);
  }, [setFiltersState]);

  // Handle filter item click - public API for the component
  const handleFilterItemClick = (facet: string, value: string) => {
    if (Object.keys(facets).includes(facet)) {
      toggleFilter(facet as FacetType, value);
    }
  };

  // Check if a filter is active
  const isFilterActive = useCallback((facetName: FacetType, value: string) => {
    return (filters[facetName as keyof typeof filters] || []).includes(value);
  }, [filters]);

  // Get active filters count
  const activeFiltersCount = Object.values(filters || {}).reduce<number>(
    (count, values) => count + (Array.isArray(values) ? values.length : 0),
    0
  );

  // Handle facet click - public API for the component
  const handleFacetClick = (facet: string) => {
    if (Object.keys(facets).includes(facet)) {
      setActiveFacet(prev => prev === facet ? null : facet as FacetType);
    }
  };

  // Close mobile filters when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMobileFiltersOpen) {
        setIsMobileFiltersOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileFiltersOpen]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {query ? `Search results for "${query}"` : 'All Products'}
        </h1>
        <p className="text-gray-500 mt-1">
          {products.length} {products.length === 1 ? 'item' : 'items'} found
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Mobile filter dialog */}
        <div className="md:hidden relative">
          <button
            type="button"
            onClick={toggleMobileFilters}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {isMobileFiltersOpen && (
            <div 
              className="absolute z-10 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">Filters</h3>
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {renderFacets()}
              </div>
            </div>
          )}
        </div>

        {/* Desktop filters */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-4 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              )}
            </div>
            {renderFacets()}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Active filters */}
          {renderActiveFilters()}

          {/* Sort */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{products.length}</span> results
            </p>
            <div className="flex items-center">
              <label htmlFor="sort" className="text-sm font-medium text-gray-700 mr-2">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Results */}
          {renderResults()}
        </div>
      </div>
    </div>
  );

  // Helper function to render filter facets
  function renderFacets() {
    return (
      <div className="space-y-6">
        {Object.entries(facets).map(([facetName, values]) => (
          <div key={facetName} className="border-t border-gray-200 pt-4">
            <button
              onClick={() => handleFacetClick(facetName)}
              className="flex w-full items-center justify-between text-sm text-gray-600 hover:text-gray-900"
            >
              <span className="font-medium text-gray-900 capitalize">
                {facetName}
              </span>
              <span className="ml-2 flex items-center">
                {activeFacet === facetName ? (
                  <span className="text-gray-400">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                ) : (
                  <span className="text-gray-400">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </span>
            </button>
            <div
              className={`pt-4 ${
                activeFacet === facetName || isMobileFiltersOpen ? 'block' : 'hidden'
              }`}
            >
              {renderFacetValues(facetName as FacetType)}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
