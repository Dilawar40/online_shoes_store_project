"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Search() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize search query from URL params
  useEffect(() => {
    const query = searchParams?.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  // Focus search input when mobile search is opened
  useEffect(() => {
    if (isMobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      // Close mobile search after submission
      if (window.innerWidth < 768) {
        setIsMobileSearchOpen(false);
      }
    }
  };

  // Mobile search toggle
  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  };

  return (
    <>
      {/* Mobile Search Button (visible on small screens) */}
      <button
        type="button"
        onClick={toggleMobileSearch}
        className="p-2 text-gray-700 rounded-md md:hidden dark:text-gray-300 hover:text-black dark:hover:text-white"
        aria-label="Search"
      >
        <MagnifyingGlassIcon className="w-6 h-6" />
      </button>

      {/* Search Form (desktop) */}
      <form
        onSubmit={handleSubmit}
        className={`hidden md:block w-full max-w-2xl mx-4 ${isMobileSearchOpen ? 'hidden' : 'block'}`}
      >
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            name="q"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            autoComplete="off"
            className="w-full px-4 py-2 text-sm text-black placeholder-gray-500 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-0 top-0 flex items-center justify-center h-full px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
          <div className="flex items-center w-full h-16 px-4 bg-white dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="flex-1 flex">
              <div className="relative flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  name="q"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  autoComplete="off"
                  className="w-full px-4 py-2 pr-10 text-black bg-white border border-gray-300 rounded-l-md dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 flex items-center justify-center h-full px-3 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </div>
              <button
                type="button"
                onClick={toggleMobileSearch}
                className="px-4 text-gray-700 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function SearchSkeleton() {
  return (
    <div className="hidden w-full max-w-2xl mx-4 md:block">
      <div className="relative">
        <div className="w-full h-10 bg-gray-200 rounded-md dark:bg-gray-700 animate-pulse"></div>
        <div className="absolute right-0 top-0 flex items-center justify-center h-full px-3 text-gray-400">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
