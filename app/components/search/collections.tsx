import {
  sorting,
  defaultSort,
  getCollection,
  getCollectionProducts,
  staticCollections,
} from "@/app/lib/constants";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Grid from "../grid/grid";
import ProductGridItems from "../product-grid-items";
import Link from "next/link";

// Filter out the 'all' collection and sort by sortOrder
const getCategories = () => {
  return [...staticCollections]
    .filter((collection) => collection.handle !== "all")
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

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
  });

  // If no products found in this collection, show main categories
  if (products.length === 0) {
    const mainCategories = [
      { id: "all", title: "All", handle: "all" },
      { id: "khussa", title: "Khussa", handle: "khussa" },
    ];

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xs">
          <nav>
            <ul className="space-y-2">
              {mainCategories.map((category) => {
                const href =
                  category.handle === "all"
                    ? "/search?sort=featured"
                    : `/search/${category.handle}?sort=featured`;

                return (
                  <li key={category.id}>
                    <Link
                      href={href}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {category.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    );
  }

  // Otherwise, show the products in the collection
  return (
    <section>
      <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <ProductGridItems products={products} />
      </Grid>
    </section>
  );
}
