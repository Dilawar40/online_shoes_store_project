"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getCollectionProducts,
  defaultSort,
  sorting,
  Product,
} from "@/app/lib/constants";
import Link from "next/link";
import Image from "next/image";

// Function to sort products based on the selected sort option
const sortProducts = (
  products: Product[],
  sortKey: string,
  reverse: boolean
): Product[] => {
  const sorted = [...products];

  switch (sortKey) {
    case "PRICE":
      sorted.sort((a, b) => a.price.amount - b.price.amount);
      break;
    case "CREATED_AT":
      sorted.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      break;
  }

  return reverse ? sorted.reverse() : sorted;
};

// Fetch search results
async function getSearchResults({
  collection,
  query,
  sortKey,
  reverse,
}: {
  collection?: string;
  query?: string;
  sortKey: string;
  reverse: boolean;
}) {
  const products = await getCollectionProducts({
    collection: collection === "all" ? undefined : collection,
  });

  const searchQuery = (query || "").toLowerCase();
  let filteredProducts = searchQuery
    ? products.filter((product: Product) =>
        product.title.toLowerCase().includes(searchQuery)
      )
    : [...products];

  return sortProducts(filteredProducts, sortKey, reverse);
}

export default function SearchClient({
  initialCollection,
}: {
  initialCollection: string;
}) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImages, setActiveImages] = useState<Record<string, string>>({});

  // Get values from URL params
  const sort = searchParams.get("sort") || "";
  const query = searchParams.get("q") || "";
  // Default to 'all' if no collection is specified
  const collection = initialCollection || 'all';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const sortOption =
          sorting.find((item) => item.slug === sort) || defaultSort;

        // Always fetch all products if no specific collection is selected
        const collectionToFetch = collection === 'all' ? undefined : collection;
        
        const result = await getSearchResults({
          collection: collectionToFetch,
          query,
          sortKey: sortOption.sortKey,
          reverse: !!sortOption.reverse,
        });

        // Set default active image for each product
        const initialImages: Record<string, string> = {};
        result.forEach((p) => {
          initialImages[p.handle] = p.featuredImage?.url || "/placeholder.jpg";
        });

        setProducts(result);
        setActiveImages(initialImages);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [sort, query, collection]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="w-full">
        {/* Sorting Dropdown */}
        {/* <div className="flex justify-end mb-4">
          <div className="relative inline-block text-left">
            <select
              value={sort}
              onChange={(e) => {
                const newSort = e.target.value;
                const params = new URLSearchParams(searchParams.toString());
                params.set("sort", newSort);
                window.history.pushState({}, "", `?${params.toString()}`);
                window.dispatchEvent(new Event("popstate"));
              }}
              className="block w-48 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300  shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Sort products"
            >
              <option value="" disabled>
                Sort by
              </option>
              {sorting.map((item) => (
                <option
                  key={item.slug || "default"}
                  value={item.slug || ""}
                  className="text-gray-900"
                >
                  {item.title}
                </option>
              ))}
            </select>
          </div>
        </div> */}

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
          {products.map((product) => (
            <Link
              key={product.handle}
              href={`/product/${product.handle}`}
              className="group block h-full"
              style={{
                cursor: "pointer",
              }}
            >
              {/* Main image */}
              <div className="group relative bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 w-full h-full">
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  <img
                    src={
                      activeImages[product.handle] ||
                      product.images[0]?.url ||
                      "/placeholder-product.jpg"
                    }
                    alt={product.title}
                    className="object-cover w-full h-full group-hover:opacity-90 transition-opacity duration-200"
                  />
                </div>

                {/* Thumbnails */}
                <div className="flex items-center mt-2 space-x-1 overflow-x-auto pb-2 no-scrollbar">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-12 h-12 cursor-pointer"
                      onMouseEnter={() => {
                        setActiveImages((prev) => ({
                          ...prev,
                          [product.handle]: image.url,
                        }));
                      }}
                    >
                      <img
                        src={image.url}
                        alt={image.altText}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>

                {/* Product info */}
                <div className="px-2 py-2">
                  {/* Title */}
                  <h3 className="text-base font-semibold line-clamp-2">
                    {product.title}
                  </h3>

                  {/* Price & Compare Price */}
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="text-lg font-bold">
                      Rs. {product.price.amount.toLocaleString()}
                    </span>
                    {product.variants[0]?.compareAtPrice?.amount &&
                      product.variants[0].compareAtPrice.amount >
                        product.price.amount && (
                        <span className="text-sm text-gray-400 line-through">
                          Rs.{" "}
                          {product.variants[0].compareAtPrice.amount.toLocaleString()}
                        </span>
                      )}
                  </div>

                  {/* Discount Badge */}
                  {product.variants[0]?.compareAtPrice?.amount &&
                    product.variants[0].compareAtPrice.amount >
                      product.price.amount && (
                      <div className="inline-block px-2 py-0.5 mt-2 text-xs font-medium text-red-100 bg-red-600 rounded">
                        {Math.round(
                          (1 -
                            product.price.amount /
                              product.variants[0].compareAtPrice.amount) *
                            100
                        )}
                        % OFF
                      </div>
                    )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
