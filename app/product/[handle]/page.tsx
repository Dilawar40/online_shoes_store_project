import { notFound } from "next/navigation";
import { ProductProvider } from "@/app/components/product/product-context";
import { staticProducts } from "@/app/lib/constants";
import { ProductDescription } from "@/app/components/product/product-description";
import { ProductImageGallery } from "@/app/components/product/product-image-gallery";
import Footer from "@/app/components/footer";
import type { Metadata } from 'next';

interface PageProps {
  params: { handle: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({
  params,
}: {
  params: { handle: string };
}): Promise<Metadata> {
  const product = staticProducts.find((p) => p.handle === params.handle);
  if (!product) return {};
  
  return {
    title: product.title,
    description: product.description,
  };
}

export default function Page({ params }: { params: { handle: string } }) {
  const product = staticProducts.find((p) => p.handle === params.handle);
  if (!product) return notFound();
  
  return (
    <ProductProvider product={product}>
      <div className="mx-auto max-w-screen-2xl px-4">
        <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-black md:p-12 lg:flex-row lg:gap-8">
          <div className="h-full w-full basis-full lg:basis-4/6">
            <div className="w-full max-w-[600px] mx-auto">
              <ProductImageGallery images={product.images} />
            </div>
          </div>
          <div className="basis-full lg:basis-2/6">
            <ProductDescription product={product} />
          </div>
        </div>
      </div>
      <Footer />
    </ProductProvider>
  );
}
