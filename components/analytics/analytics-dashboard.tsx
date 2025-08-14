'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Client-side only chart component
const Chart = dynamic(() => import('./chart'), { 
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />
});

import { analyticsService } from '@/lib/analytics';

interface AnalyticsData {
  popularSearches: { query: string; count: number }[];
  filterUsage: { name: string; count: number }[];
  conversionRate: number;
}

const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData>({
    popularSearches: [],
    filterUsage: [],
    conversionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const popularSearches = analyticsService.getPopularSearches(5);
        const filterData = analyticsService.getFilterUsage();
        const conversionRate = analyticsService.getSearchConversionRate();
        
        setData({
          popularSearches,
          filterUsage: Object.entries(filterData)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
          conversionRate
        });
      } catch (err) {
        console.error('Failed to load analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const { popularSearches, filterUsage, conversionRate } = data;

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Search Analytics</h2>
        <div className="text-sm text-gray-500">
          {isLoading ? 'Updating...' : `Last updated: ${new Date().toLocaleTimeString()}`}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular Searches */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <svg className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            Popular Searches
          </h3>
          <div className="space-y-2">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex justify-between items-center p-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))
            ) : popularSearches.length > 0 ? (
              popularSearches.map(({ query, count }) => (
                <div 
                  key={query || 'empty'} 
                  className="flex justify-between items-center p-3 hover:bg-gray-100 rounded-lg transition-colors duration-150"
                >
                  <span className="text-gray-700 truncate max-w-[200px]">
                    {query || '(empty search)'}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
                    {count} {count === 1 ? 'search' : 'searches'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No search data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Filter Usage */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Filter Usage</h3>
          {filterUsage.length > 0 ? (
            <div className="h-64">
              <Chart data={filterUsage} />
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No filter usage data available</p>
          )}
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Search Conversion Rate</h3>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${conversionRate}%` }}
            />
          </div>
          <span className="ml-4 text-gray-700 font-medium">
            {conversionRate.toFixed(1)}%
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Percentage of searches that returned at least one result
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
