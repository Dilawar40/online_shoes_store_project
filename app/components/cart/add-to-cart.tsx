"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useProduct } from "../product/product-context";
import { Product } from "@/app/lib/constants";
import { useCart } from "./cart-context";

// Toast notifications will be added later

function SubmitButton({
  availableForSale,
  selectedVariantId,
  onClick,
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const buttonClasses =
    "relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white";
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

  if (!availableForSale) {
    return (
      <button type="button" disabled className={clsx(buttonClasses, disabledClasses)}>
        Out Of Stock
      </button>
    );
  }

  return (
    <button
      type="submit"
      className={clsx(buttonClasses, {
        [disabledClasses]: !selectedVariantId,
      })}
      disabled={!selectedVariantId}
      onClick={onClick}
    >
      <PlusIcon className="mr-2 h-5" />
      Add To Cart
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();
  console.log(variants);

  const variant = variants.find((variant) => {
    if (!variant.selectedOptions) return false;
    return variant.selectedOptions.every(
      (option: { name: string; value: string }) =>
        option.value === state[option.name.toLowerCase()]
    );
  });

  const selectedVariantId =
    variant?.id || (variants.length === 1 ? variants[0]?.id : undefined);
  const finalVariant = variant || variants[0];

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalVariant) {
      // Ensure price is in the correct format for the cart
      const variantWithCorrectPrice = {
        ...finalVariant,
        price: {
          amount: Number(finalVariant.price.amount),
          currencyCode: finalVariant.price.currencyCode || "PKR",
        },
      };
      addCartItem(variantWithCorrectPrice,product);
    } else {
      console.log("Please select an option - no variant found");
    }
  };

  return (
    <form onSubmit={handleAddToCart}>
    <SubmitButton
  availableForSale={finalVariant?.inventoryQuantity > 0}
  selectedVariantId={selectedVariantId}
  onClick={(e) => {
    e.preventDefault();
    handleAddToCart(e);
  }}
/>
  </form>
  );
}