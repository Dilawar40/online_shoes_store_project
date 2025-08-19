"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useProduct } from "../product/product-context";
import { Product } from "@/app/lib/constants";
import { useCart } from "./cart-context";
import { useRouter } from "next/navigation";

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

  console.log("🔹 SubmitButton Rendered");
  console.log("   availableForSale:", availableForSale);
  console.log("   isDisabled:", isDisabled);

  if (!availableForSale) {
    console.log("⚠️ Product not available for sale → button disabled");
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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("✅ Add To Cart clicked!");
    console.log("   Disabled:", isDisabled);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type="submit"
      className={clsx(buttonClasses, {
        [disabledClasses]: isDisabled,
      })}
      disabled={isDisabled}
      onClick={handleClick}
    >
      <PlusIcon className="mr-2 h-5" />
      Add To Cart
    </button>
  );
}

interface AddToCartProps {
  product: Product;
  onAddToCart?: () => void;
}

export function AddToCart({ product, onAddToCart }: AddToCartProps) {
  const { variants } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();
  const router = useRouter();

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

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("handleAddToCart called");
    console.log("finalVariant:", finalVariant);
    console.log("allOptionsSelected:", allOptionsSelected);
    console.log("Current state:", state);

    if (!finalVariant || !allOptionsSelected) {
      console.error(
        "Cannot add to cart: ",
        !finalVariant ? "No variant selected" : "Not all options selected"
      );
      return;
    }

    // Create a clean variant with only the selected options
    const cleanSelectedOptions = finalVariant.selectedOptions?.map(option => {
      // If this is a size option and contains slashes, use the selected size from state
      if ((option.name.toLowerCase() === 'size' || option.name.toLowerCase() === 'sizes') && option.value.includes('/')) {
        const selectedSize = state[option.name.toLowerCase()];
        return {
          ...option,
          value: selectedSize || option.value.split('/')[0].trim() // Fallback to first size if none selected
        };
      }
      return option;
    });

    const variantWithCorrectPrice = {
      ...finalVariant,
      selectedOptions: cleanSelectedOptions,
      price: {
        amount: Number(finalVariant.price.amount),
        currencyCode: finalVariant.price.currencyCode || "PKR",
      },
    };

    console.log("Variant with price and clean options:", variantWithCorrectPrice);

    const productForCart = {
      ...product,
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      images: product.images,
      options: product.options,
    };

    console.log("Adding to cart:", {
      variant: variantWithCorrectPrice,
      product: productForCart,
    });

    try {
      await addCartItem(variantWithCorrectPrice, productForCart);
      console.log("Successfully added to cart");
      // Call the onAddToCart callback if provided
      if (onAddToCart) {
        onAddToCart();
      }
    } catch (error) {
      console.error("Error in handleAddToCart:", error);
    }
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
