import Grid from "@/app/components/grid/grid";
import ProductGridItems from "@/app/components/product-grid-items";
import {
  defaultSort,
  getCollection,
  getCollectionProducts,
  sorting,
} from "@/app/lib/constants";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata(props: {
  params: { collection: string };
}): Promise<Metadata> {
  const { params } = props;
  const collection = await getCollection(params.collection);

  if (!collection) return notFound();

  return {
    title: collection.title,
    description: collection.description || `${collection.title} products`,
  };
}

export default async function CategoryPage(props: {
  params: { collection: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { searchParams = {}, params } = props;
  const { sort } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;
  const products = await getCollectionProducts({
    collection: params.collection,
    sortKey,
    reverse,
  });

  return (
    <section>
      {products.length === 0 ? (
        <p className="py-3 text-lg">{`No products found in this collection`}</p>
      ) : (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      )}
    </section>
  );
}
