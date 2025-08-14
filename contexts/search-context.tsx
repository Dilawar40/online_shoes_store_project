'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { staticProducts, transformStaticProducts } from '@/app/lib/constants';
import { Product as ProductType } from '@/types/product.types';

// Local type that combines both Product types
interface LocalProduct extends Omit<ProductType, 'collections' | 'tags'> {
  collections: Array<{ id: string; handle: string; title: string }>;
  tags: string[];
  availableForSale?: boolean;
  createdAt?: string;
  updatedAt?: string; 
}

type FacetValue = {
  value: string;
  count: number;
};

type Facets = Record<string, FacetValue[]>;

type SearchContextType = {
  query: string;
  setQuery: (query: string) => void;
  filters: Record<string, string[]>;
  setFilters: (filters: Record<string, string[]>) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  results: ProductType[];
  isLoading: boolean;
  suggestions: string[];
  facets: Facets;
  clearFilters: () => void;
  removeFilter: (filterType: string, value: string) => void;
  search: (searchQuery: string, filters: Record<string, string[]>, sortOption: string) => Promise<ProductType[]>;
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Helper function to get price range
const getPriceRange = (price: number): string => {
  const priceValue = typeof price === 'number' ? price : 0;
  if (priceValue < 25) return 'under-25';
  if (priceValue < 50) return '25-50';
  if (priceValue < 100) return '50-100';
  return '100-plus';
};

// Helper function to get unique values for facets
const getFacets = (products: LocalProduct[]): Facets => {
  const facetMap: Record<string, Set<string>> = {};

  products.forEach(product => {
    // Handle collections as categories
    if (product.collections?.length > 0) {
      if (!facetMap.category) facetMap.category = new Set();
      product.collections.forEach(collection => {
        facetMap.category.add(collection.title);
      });
    }

    // Handle price ranges
    const price = typeof product.price === 'number' ? product.price : product.price?.amount || 0;
    const priceRange = getPriceRange(price);
    if (priceRange) {
      if (!facetMap.price) facetMap.price = new Set();
      facetMap.price.add(priceRange);
    }

    // Handle availability
    const availability = product.availableForSale ? 'in-stock' : 'out-of-stock';
    if (!facetMap.availability) facetMap.availability = new Set();
    facetMap.availability.add(availability);
  });

  // Convert sets to arrays
  const result: Facets = {};

  Object.entries(facetMap).forEach(([facetName, values]) => {
    result[facetName] = Array.from(values).map(value => ({
      value,
      count: products.filter(product => {
        if (facetName === 'category') {
          return product.collections.some(collection => collection.title === value);
        } else if (facetName === 'price') {
          const price = typeof product.price === 'number' ? product.price : product.price?.amount || 0;
          const [min, max] = value.split('-').map(Number);
          return price >= min && (!max || price <= max);
        } else if (facetName === 'availability') {
          return (product.availableForSale ? 'in-stock' : 'out-of-stock') === value;
        }
        return false;
      }).length,
    }));
  });

  return result;
};

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State management
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState('featured');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<LocalProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get products with proper typing
  const getProducts = useCallback((): LocalProduct[] => {
    const transformed = transformStaticProducts(staticProducts);
    return transformed.map(product => ({
      ...product,
      id: product.id || '',
      handle: product.handle || '',
      title: product.title || '',
      description: product.description || '',
      price: product.price || { amount: 0, currencyCode: 'USD' },
      priceRange: product.priceRange || {
        minVariantPrice: product.price || { amount: 0, currencyCode: 'USD' },
        maxVariantPrice: product.price || { amount: 0, currencyCode: 'USD' }
      },
      minVariantPrice: product.minVariantPrice || product.price || { amount: 0, currencyCode: 'USD' },
      maxVariantPrice: product.maxVariantPrice || product.price || { amount: 0, currencyCode: 'USD' },
      featuredImage: product.featuredImage || { url: '', altText: '' },
      variants: product.variants || [],
      options: product.options || [],
      images: product.images || [],
      availableForSale: product.availableForSale ?? true,
      status: product.status || 'active',
      collections: product.collections || [],
      tags: product.tags || [],
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: product.updatedAt || new Date().toISOString()
    }));
  }, []);

  // Search function
  const searchProducts = useCallback(async (
    searchQuery: string,
    filterParams: Record<string, string[]>,
    sortOption: string
  ): Promise<LocalProduct[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const products = getProducts();
      let filtered = [...products];

      // Apply search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        filtered = filtered.filter(product => {
          const productTags = product.tags || [];
          return (
            product.title.toLowerCase().includes(searchLower) ||
            (product.description || '').toLowerCase().includes(searchLower) ||
            productTags.some(tag => tag.toLowerCase().includes(searchLower))
          );
        });
      }

      // Apply filters
      filtered = Object.entries(filterParams).reduce((result, [key, values]) => {
        if (!values?.length) return result;
        
        return result.filter(product => {
          if (key === 'collections') {
            return product.collections?.some(collection => 
              values.includes(collection.title)
            );
          } else if (key === 'tags') {
            return values.some(value => product.tags?.includes(value));
          } else if (key === 'price') {
            const price = typeof product.price === 'number' 
              ? product.price 
              : product.price?.amount || 0;
            return values.some(range => {
              const [min, max] = range.split('-').map(Number);
              return price >= min && (!max || price <= max);
            });
          } else if (key === 'availability') {
            const isAvailable = product.availableForSale ?? true;
            return values.includes(isAvailable ? 'in-stock' : 'out-of-stock');
          }
          return true;
        });
      }, filtered);

      // Apply sorting
      filtered.sort((a: LocalProduct, b: LocalProduct) => {
        const aPrice = typeof a.price === 'number' ? a.price : a.price?.amount || 0;
        const bPrice = typeof b.price === 'number' ? b.price : b.price?.amount || 0;
        
        switch (sortOption) {
          case 'price-asc':
            return aPrice - bPrice;
          case 'price-desc':
            return bPrice - aPrice;
          case 'newest':
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bDate - aDate;
          default: // 'featured' or any other
            return (a.title || '').localeCompare(b.title || '');
        }
      });

      return filtered;
    } catch (error) {
      console.error('Error in searchProducts:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during search');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const products = searchResults.length > 0 ? searchResults : getProducts();
    let result = [...products];

    // Apply search query if not already applied
    if (query && searchResults.length === 0) {
      const searchLower = query.toLowerCase();
      result = result.filter(product => {
        const productTags = product.tags || [];
        return (
          product.title.toLowerCase().includes(searchLower) ||
          (product.description || '').toLowerCase().includes(searchLower) ||
          productTags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply filters
    result = Object.entries(filters).reduce((filteredResult, [key, filterValues]) => {
      if (!filterValues?.length) return filteredResult;

      return filteredResult.filter(product => {
        if (key === 'collections') {
          return product.collections?.some(collection => 
            filterValues.includes(collection.title)
          );
        } else if (key === 'tags') {
          return filterValues.some(value => product.tags?.includes(value));
        } else if (key === 'price') {
          const price = typeof product.price === 'number' 
            ? product.price 
            : product.price?.amount || 0;
          return filterValues.some((range: string) => {
            const [min, max] = range.split('-').map(Number);
            return price >= min && (!max || price <= max);
          });
        } else if (key === 'availability') {
          const isAvailable = product.availableForSale ?? true;
          return filterValues.includes(isAvailable ? 'in-stock' : 'out-of-stock');
        }
        return true;
      });
    }, result);

    // Apply sorting
    result.sort((a: LocalProduct, b: LocalProduct) => {
      const aPrice = typeof a.price === 'number' ? a.price : a.price?.amount || 0;
      const bPrice = typeof b.price === 'number' ? b.price : b.price?.amount || 0;
      
      switch (sortBy) {
        case 'price-asc':
          return aPrice - bPrice;
        case 'price-desc':
          return bPrice - aPrice;
        case 'newest':
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        default: // 'featured' or any other
          return (a.title || '').localeCompare(b.title || '');
      }
    });

    return result;
  }, [searchResults, query, filters, sortBy, getProducts]);

  // Generate facets from all products for filter options
  const facets = useMemo(() => getFacets(getProducts()), [getProducts]);

  // Generate search suggestions
  const suggestions = useMemo(() => {
    if (!query) return [];
    
    const searchTerms = new Set<string>();
    const products = getProducts();
    
    products.forEach(product => {
      // Add product title words
      (product.title || '').split(' ').forEach(word => {
        if (word.toLowerCase().includes(query.toLowerCase())) {
          searchTerms.add(word);
        }
      });
      
      // Add tags
      (product.tags || []).forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          searchTerms.add(tag);
        }
      });
    });
    
    return Array.from(searchTerms).slice(0, 5);
  }, [query, getProducts]);

  // Update URL when search parameters change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams();
    
    if (query) params.set('q', query);
    if (sortBy !== 'featured') params.set('sort', sortBy);
    
    Object.entries(filters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        params.set(key, values.join(','));
      }
    });
    
    const newUrl = `${pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [query, filters, sortBy, pathname]);

  // Initialize from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get('q') || '';
    const sortParam = params.get('sort') || 'featured';

    // Initialize filters from URL
    const initialFilters: Record<string, string[]> = {};
    params.forEach((value, key) => {
      if (key !== 'q' && key !== 'sort' && value) {
        initialFilters[key] = value.split(',').filter(Boolean);
      }
    });

    setQuery(queryParam);
    setFilters(initialFilters);
    setSortBy(sortParam);

    // Perform initial search
    const performSearch = async () => {
      try {
        const results = await searchProducts(queryParam, initialFilters, sortParam);
        setSearchResults(results);
      } catch (error) {
        console.error('Error performing search:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    performSearch();
  }, [searchProducts]);

  // Helper functions
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const removeFilter = useCallback((filterType: string, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[filterType]) {
        newFilters[filterType] = newFilters[filterType].filter(v => v !== value);
        if (newFilters[filterType].length === 0) {
          delete newFilters[filterType];
        }
      }
      return newFilters;
    });
  }, []);

  // Transform LocalProduct[] to ProductType[] for the context value
  const transformedResults = useMemo((): ProductType[] => {
    return filteredProducts.map(product => {
      const { availableForSale, createdAt, updatedAt, ...rest } = product;
      return {
        ...rest,
        availableForSale: availableForSale ?? true,
        createdAt: createdAt || new Date().toISOString(),
        updatedAt: updatedAt || new Date().toISOString(),
      };
    });
  }, [filteredProducts]);

  // Context value
  const contextValue = useMemo(() => ({
    query,
    setQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    results: transformedResults,
    isLoading,
    suggestions,
    facets,
    clearFilters,
    removeFilter,
    search: searchProducts,
  }), [
    query,
    filters,
    sortBy,
    transformedResults,
    isLoading,
    suggestions,
    facets,
    clearFilters,
    removeFilter,
    searchProducts
  ]);

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
