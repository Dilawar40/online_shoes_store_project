import { Metadata } from "next";
import { notFound } from "next/navigation";
import SearchClient from "./search-client";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for products in the store.",
};

export default function SearchPage({
  params,
  searchParams,
}: {
  params: { collection?: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // If no collection is specified, default to showing all products
  const collection = params.collection?.[0] || "all";

  return (
    <div className="min-h-screen p-0 m-0">
      <SearchClient 
        initialCollection={collection} 
        key={collection} // Force re-render when collection changes
      />
    </div>
  );
}
