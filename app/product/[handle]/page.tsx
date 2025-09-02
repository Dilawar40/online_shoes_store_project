import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ProductProvider } from "@/app/components/product/product-context";
import { ProductDescription } from "@/app/components/product/product-description";
import { ProductImageGallery } from "@/app/components/product/product-image-gallery";
import { ProductCard } from "@/components/product/product-card";
import { transformProduct } from "@/lib/supabase/transform";
import ReviewsStrip from "@/components/reviews/reviews-strip";
import Footer from "@/app/components/footer";
import type { Metadata } from "next";

// Revalidate product pages every 2 minutes
export const revalidate = 120;

interface PageProps {
  params: { handle: string };
}

// Fetch a few products for suggestions
async function getProducts(limit = 8) {
  const hdrs = await headers();
  const host = hdrs.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/api/products?limit=${limit}`;
  const res = await fetch(url, { next: { revalidate: 120 } });
  if (!res.ok) return [] as any[];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// Fetch product from local API
async function getProduct(handle: string) {
  const hdrs = await headers();
  const host = hdrs.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const url = `${protocol}://${host}/api/products/${handle}`;
  const res = await fetch(url, { next: { revalidate: 120 } });
  if (!res.ok) {
    console.error("Failed to fetch product:", res.statusText);
    return null;
  }
  const data = await res.json();
  return data;
}

// Metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};

  return {
    title: product.title,
    description: product.description,
  };
}

export default async function Page({ params }: PageProps) {
  const { handle } = await params;
  const product = await getProduct(handle);
  const products = await getProducts(12);

  if (!product) return notFound();

  return (
    <ProductProvider product={product}>
      <div className="mx-auto max-w-screen-2xl  ">
        <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 dark:bg-black lg:flex-row lg:gap-6 ">
          {/* Left: Images */}
          <div className="h-full w-full  lg:basis-1/2">
            <div className="w-full mx-auto">
              <ProductImageGallery images={product.images} />
            </div>
          </div>

          {/* Right: Description */}
          <div className="basis-full lg:basis-1/2">
            <ProductDescription product={product} />
          </div>
        </div>
      </div>
      {/* Suggestions */}
      {products && products.length > 0 && (
        <div className="mx-auto max-w-screen-2xl px-4 mt-12">
          <h2 className="mb-4 text-xl font-semibold">You may also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {products
              .filter((p: any) => p.handle !== product.handle)
              .slice(0, 8)
              .map((p: any) => {
                const tp = transformProduct(p);
                // Adapt variants to satisfy Product type expected by ProductCard
                const adapted = {
                  ...tp,
                  variants: (tp.variants || []).map((v: any) => ({
                    ...v,
                    name: v.title || v.name || '',
                    stock: typeof v.inventoryQuantity === 'number' ? v.inventoryQuantity : 0,
                    options: v.selectedOptions || [],
                  })),
                } as any;
                return <ProductCard key={adapted.id} product={adapted} />;
              })}
          </div>
        </div>
      )}
      <ReviewsStrip />
      <Footer />
    </ProductProvider>
  );
}
