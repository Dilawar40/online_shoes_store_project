import { defaultSort, sorting, staticProducts } from "@/app/lib/constants";
import ProductGridItems from "../../product-grid-items";
import Grid from "../../grid/grid";

export const metadata = {
  title: "Search",
  description: "Search for products in the store.",
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  const { sort, q: searchValue } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // Filter products by searchValue (case-insensitive match on product title)
  let filtered = staticProducts;
  if (searchValue) {
    const q = searchValue.toLowerCase();
    filtered = filtered.filter((prod) => prod.title.toLowerCase().includes(q));
  }

  // Sort products
  if (sortKey === "PRICE") {
    filtered = filtered.slice().sort((a, b) => {
      const priceA = typeof a.price === "object" ? a.price.amount : a.price;
      const priceB = typeof b.price === "object" ? b.price.amount : b.price;
      return reverse ? priceB - priceA : priceA - priceB;
    });
  } else if (sortKey === "RELEVANCE") {
    // Default: do nothing or implement relevance logic if needed
  } else if (sortKey === "CREATED_AT") {
    // If you have a createdAt field, sort by it here
  }

  const resultsText = filtered.length > 1 ? "results" : "result";

  return (
    <>
      {searchValue ? (
        <p className="mb-4">
          {filtered.length === 0
            ? "There are no products that match "
            : `Showing ${filtered.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}
      {filtered.length > 0 ? (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={filtered} />
        </Grid>
      ) : null}
    </>
  );
}
