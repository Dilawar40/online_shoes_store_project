"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/* 1. Minimal local Product type that matches the UI props             */
/* ------------------------------------------------------------------ */
type ProductImage = { url: string; altText?: string };
type ProductVariant = {
  id: string;
  name: string;
  price: { amount: number; currencyCode: string };
  compareAtPrice?: { amount: number };
};
export type Product = {
  id: string;
  handle: string;
  title: string;
  description?: string;
  price: { amount: number; currencyCode: string };
  featuredImage?: ProductImage;
  images: ProductImage[];
  variants: ProductVariant[];
};

/* ------------------------------------------------------------------ */
/* 2. Client component                                                 */
/* ------------------------------------------------------------------ */
export default function SearchClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImages, setActiveImages] = useState<Record<string, string>>({});

  const query = searchParams.get("q") || "";

  /* -------------------------------------------------------------- */
  /* 3. Fetch from /api/products (GET) and transform                 */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch");
        const data: any[] = await res.json();

        /* Map server shape → UI shape */
        const mapped: Product[] = data.map((p) => ({
          id: p.id,
          handle: p.handle,
          title: p.title,
          description: p.description,
          price: {
            amount: p.price_amount,
            currencyCode: p.price_currency || "PKR",
          },
          featuredImage: p.featured_image
            ? { url: p.featured_image.url, altText: p.featured_image.altText }
            : undefined,
          images: p.images.map((img: any) => ({
            url: img.url,
            altText: img.altText,
          })),
          variants: p.variants.map((v: any) => ({
            id: v.id,
            name: v.name,
            price: { amount: v.price, currencyCode: p.price_currency || "PKR" },
            compareAtPrice: undefined, // add this later if you store it
          })),
        }));

        /* Simple client-side search */
        const filtered = query
          ? mapped.filter((p) =>
              p.title.toLowerCase().includes(query.toLowerCase())
            )
          : mapped;

        setProducts(filtered);

        /* Default active image */
        const initial: Record<string, string> = {};
        filtered.forEach((p) => {
          initial[p.handle] =
            p.featuredImage?.url || p.images[0]?.url || "/placeholder.jpg";
        });
        setActiveImages(initial);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [query]);

  /* ------------------------------------------------------------------ */
  /* 4. Render (unchanged)                                              */
  /* ------------------------------------------------------------------ */
  if (isLoading) return <div className="p-4">Loading…</div>;
  if (!products.length)
    return (
      <div className="p-4 text-center text-gray-500">No products found.</div>
    );

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
        {products.map((product, i) => {
          return (
            <Link
              key={product.handle}
              href={`/product/${product.handle}`}
              className="group block h-full"
            >
              <div className="group relative bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow w-full h-full">
                <div className="aspect-square bg-gray-200 relative">
                  <img
                    src={activeImages[product.handle] || product.images[0]?.url}
                    alt={product.title}
                    className="object-cover w-full h-full group-hover:opacity-90"
                  />
                </div>

                {/* thumbnails */}
                <div className="flex items-center mt-2 space-x-1 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 w-12 h-12 cursor-pointer"
                      onMouseEnter={() =>
                        setActiveImages((prev) => ({
                          ...prev,
                          [product.handle]: img.url,
                        }))
                      }
                    >
                      <img
                        src={img.url}
                        alt={img.altText}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>

                <div className="px-2 py-2">
                  <h3 className="text-base font-semibold line-clamp-2">
                    {product.title}
                  </h3>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="text-lg font-bold">
                      Rs. {product.price.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
