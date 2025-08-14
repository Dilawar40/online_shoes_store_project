import { Product } from "@/app/lib/constants";
import { VariantSelector } from "./variant-selector";
import Price from "../Price";
import Prose from "../prose";
import { AddToCart } from "../cart/add-to-cart";

export function ProductDescription({ product }: { product: Product }) {
  // Transform variants to match ProductVariant type
  const transformedVariants = product.variants.map(variant => ({
    ...variant,
    price: {
      amount: variant.price.amount.toString(),
      currencyCode: variant.price.currencyCode || 'PKR'
    },
    compareAtPrice: variant.compareAtPrice ? {
      amount: variant.compareAtPrice.amount.toString(),
      currencyCode: variant.compareAtPrice.currencyCode || 'PKR'
    } : undefined
  }));

  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-5xl font-medium">{product.title}</h1>
        <div className="mr-auto w-auto rounded-full bg-blue-600 p-2 text-sm text-white">
          <Price
            amount={product.priceRange.maxVariantPrice.amount}
            currencyCode={product.priceRange.maxVariantPrice.currencyCode}
          />
        </div>
      </div>
      <VariantSelector options={product.options} variants={transformedVariants} />
      {product.description ? (
        <Prose
          className="mb-6 text-sm leading-tight dark:text-white/[60%]"
          html={product.description}
        />
      ) : null}
     
        <AddToCart product={product} />
      
    </>
  );
}
