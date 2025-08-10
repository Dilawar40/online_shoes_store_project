// app/search/[[...collection]]/page.tsx
import Grid from "@/app/components/grid/grid";
import ProductGridItems from "@/app/components/product-grid-items";
import {
  defaultSort,
  getCollectionProducts,
  sorting,
  getCollection,
} from "@/app/lib/constants";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ collection?: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                          */
/* ------------------------------------------------------------------ */
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const handle = params.collection?.[0] ?? "all";

  // do NOT throw for "all"
  if (handle === "all") {
    return {
      title: "All Products",
      description: "Browse all products",
    };
  }

  try {
    const collection = await getCollection(handle);
    return {
      title: collection.title,
      description: collection.description || `${collection.title} products`,
    };
  } catch {
    notFound();
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default async function CategoryPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  console.log("[CategoryPage] params ===============", params);
  console.log("[CategoryPage] searchParams ===============", searchParams);

  const handle = params.collection?.[0] ?? "all";
  const query = searchParams?.q as string | undefined;

  const sortParam = (searchParams?.sort as string) ?? "";
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sortParam) ?? defaultSort;

  const products = await getCollectionProducts({
    collection: handle === "all" ? undefined : handle,
    sortKey,
    reverse,
  });

  // Filter products based on the search query
  const filteredProducts = query
    ? products.filter((product) =>
        product.title.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  if (filteredProducts.length === 0) {
    return (
      <p className="py-3 text-lg">{`No products found in this collection`}</p>
    );
  }

  return (
    <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <ProductGridItems products={filteredProducts} />
    </Grid>
  );
}