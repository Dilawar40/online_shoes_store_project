'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useSearch } from '@/contexts/search-context';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { query, setQuery, suggestions, isLoading } = useSearch();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      inputRef.current?.blur();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    setIsFocused(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsFocused(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Search products"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      {isFocused && (query || suggestions.length > 0) && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-96 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          ) : suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          ) : query ? (
            <div className="p-4 text-sm text-gray-500">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
