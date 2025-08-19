import { notFound } from "next/navigation";
import { ProductProvider } from "@/app/components/product/product-context";
import { ProductDescription } from "@/app/components/product/product-description";
import { ProductImageGallery } from "@/app/components/product/product-image-gallery";
import Footer from "@/app/components/footer";
import type { Metadata } from "next";

interface PageProps {
  params: { handle: string };
}

// Fetch product from local API
async function getProduct(handle: string) {
  const url = `http://localhost:3000/api/products/${handle}`;

  const res = await fetch(url, {
    cache: "no-store", // always fresh
  });

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

  if (!product) return notFound();

  return (
    <ProductProvider product={product}>
      <div className="mx-auto max-w-screen-2xl px-4">
        <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-black md:p-12 lg:flex-row lg:gap-8">
          {/* Left: Images */}
          <div className="h-full w-full basis-full lg:basis-4/6">
            <div className="w-full max-w-[600px] mx-auto">
              <ProductImageGallery images={product.images} />
            </div>
          </div>

          {/* Right: Description */}
          <div className="basis-full lg:basis-2/6">
            <ProductDescription product={product} />
          </div>
        </div>
      </div>
      <Footer />
    </ProductProvider>
  );
}
