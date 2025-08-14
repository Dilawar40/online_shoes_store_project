'use client';

import dynamic from 'next/dynamic';
import { Product } from '@/app/lib/constants';

const SearchClient = dynamic(
  () => import('@/app/components/search/search-client'),
  { 
    ssr: false, 
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        Loading...
      </div>
    ) 
  }
);

export default function SearchClientWrapper({
  initialProducts,
  sortOption,
  searchParams
}: {
  initialProducts: Product[];
  sortOption: {
    slug: string | null;
    sortKey: string;
    reverse: boolean;
    title: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <SearchClient 
      initialProducts={initialProducts}
      sortOption={sortOption}
      searchParams={searchParams}
    />
  );
}
