"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
/* 1.1 Mobile-only rotating image component                            */
/* ------------------------------------------------------------------ */
function RotatingImage({
  product,
  staticSrc,
}: {
  product: Product;
  staticSrc: string;
}) {
  // Build gallery from product images with fallback
  const gallery = useMemo(() => {
    const urls = product.images?.map((img) => img.url).filter(Boolean) || [];
    if (!urls.length && product.featuredImage?.url) urls.push(product.featuredImage.url);
    if (!urls.length) urls.push("/placeholder.jpg");
    return urls;
  }, [product.images, product.featuredImage]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mqlRef = useRef<MediaQueryList | null>(null);

  // Reset index when gallery changes
  useEffect(() => {
    setCurrentIdx(0);
  }, [gallery.length]);

  // Start/stop rotation based on visibility and mobile breakpoint
  useEffect(() => {
    if (!containerRef.current) return;
    if (gallery.length <= 1) return;

    const mql = window.matchMedia("(max-width: 640px)");
    mqlRef.current = mql;

    const clearTicker = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const startTicker = () => {
      if (intervalRef.current || gallery.length <= 1) return;
      intervalRef.current = setInterval(() => {
        setCurrentIdx((i) => (i + 1) % gallery.length);
      }, 2500);
    };

    const handleVisibility = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      const halfVisible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      if (mql.matches && halfVisible) startTicker();
      else clearTicker();
    };

    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(handleVisibility, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });
    observerRef.current.observe(containerRef.current);

    const handleMqlChange = () => {
      if (!mql.matches) clearTicker();
      // retrigger observer callback by un/observe
      if (observerRef.current && containerRef.current) {
        observerRef.current.unobserve(containerRef.current);
        observerRef.current.observe(containerRef.current);
      }
    };
    mql.addEventListener?.("change", handleMqlChange);

    return () => {
      clearTicker();
      mql.removeEventListener?.("change", handleMqlChange);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [gallery.length]);

  // Choose which src to render: rotate on mobile, static otherwise
  const mobile = mqlRef.current?.matches ?? false;
  const src = mobile ? gallery[currentIdx] : staticSrc;

  return (
    <div ref={containerRef} className="aspect-square bg-gray-200 relative">
      <img
        src={src}
        alt={product.title}
        className="object-cover w-full h-full group-hover:opacity-90"
      />
    </div>
  );
}

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
        const res = await fetch("/api/products?limit=40");
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
              onMouseEnter={() => {
                const hoverUrl =
                  product.images[1]?.url ||
                  product.featuredImage?.url ||
                  product.images[0]?.url;
                if (hoverUrl) {
                  setActiveImages((prev) => ({
                    ...prev,
                    [product.handle]: hoverUrl,
                  }));
                }
              }}
              onMouseLeave={() => {
                const defaultUrl =
                  product.featuredImage?.url || product.images[0]?.url;
                if (defaultUrl) {
                  setActiveImages((prev) => ({
                    ...prev,
                    [product.handle]: defaultUrl,
                  }));
                }
              }}
            >
              <div className="group relative bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow w-full h-full">
                <RotatingImage
                  product={product}
                  staticSrc={activeImages[product.handle] || product.images[0]?.url || "/placeholder.jpg"}
                />

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
