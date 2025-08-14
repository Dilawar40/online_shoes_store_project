"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useProduct } from "../product/product-context";
import { Product } from "@/app/lib/constants";
import { useCart } from "./cart-context";

interface SubmitButtonProps {
  availableForSale: boolean;
  isDisabled: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function SubmitButton({
  availableForSale,
  isDisabled,
  onClick,
}: SubmitButtonProps) {
  const buttonClasses =
    "relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white";
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

  if (!availableForSale) {
    return (
      <button
        type="button"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        Out Of Stock
      </button>
    );
  }

  return (
    <button
      type="submit"
      className={clsx(buttonClasses, {
        [disabledClasses]: isDisabled,
      })}
      disabled={isDisabled}
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

  // Check if all required options are selected
  const areAllOptionsSelected = () => {
    if (variants.length === 1 && !variants[0].selectedOptions) {
      return true; // Product has no variants to select
    }

    // Get all unique option names (like 'color', 'size')
    const allOptionNames = Array.from(
      new Set(
        variants.flatMap(
          (v) => v.selectedOptions?.map((opt) => opt.name.toLowerCase()) || []
        )
      )
    );

    // Check if all options have a selected value in state
    return allOptionNames.every(
      (optionName) =>
        state[optionName] !== undefined && state[optionName] !== ""
    );
  };

  // Find the selected variant based on selected options
  const variant = variants.find((variant) => {
    if (!variant.selectedOptions) return variants.length === 1;
    return variant.selectedOptions.every(
      (option: { name: string; value: string }) =>
        option.value === state[option.name.toLowerCase()]
    );
  });

  const finalVariant =
    variant || (variants.length === 1 ? variants[0] : undefined);
  const availableForSale = (finalVariant?.inventoryQuantity ?? 0) > 0;
  const allOptionsSelected = areAllOptionsSelected();

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();

    if (!finalVariant || !allOptionsSelected) {
      console.error("Please select all required options");
      return;
    }

    const variantWithCorrectPrice = {
      ...finalVariant,
      price: {
        amount: Number(finalVariant.price.amount),
        currencyCode: finalVariant.price.currencyCode || "PKR",
      },
    };

    const productForCart = {
      ...product,
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      images: product.images,
      options: product.options,
    };

    addCartItem(variantWithCorrectPrice, productForCart);
  };

  return (
    <form onSubmit={handleAddToCart}>
      <SubmitButton
        availableForSale={availableForSale}
        isDisabled={!allOptionsSelected}
        onClick={(e) => {
          e.preventDefault();
          handleAddToCart(e);
        }}
      />
    </form>
  );
}
