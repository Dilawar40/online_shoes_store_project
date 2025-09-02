"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useProduct } from "../product/product-context";
import { Product } from "@/app/lib/constants";
import { useCart } from "./cart-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [quantity, setQuantity] = useState(1);

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
  const maxQty = Math.max(1, finalVariant?.inventoryQuantity ?? 10);

  const dec = () => setQuantity((q) => Math.max(1, q - 1));
  const inc = () => setQuantity((q) => Math.min(maxQty, q + 1));

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

    // Build selected options from current state (ensures only the chosen values go into cart)
    const selectedOptionsFromState = (product.options || [])
      .map((opt) => {
        const key = opt.name?.toLowerCase();
        const val = key ? state[key] : undefined;
        return val
          ? ({ name: opt.name, value: String(val) } as { name: string; value: string })
          : undefined;
      })
      .filter(Boolean) as Array<{ name: string; value: string }>;

    const variantWithCorrectPrice = {
      ...finalVariant,
      selectedOptions:
        selectedOptionsFromState.length > 0
          ? selectedOptionsFromState
          : finalVariant.selectedOptions,
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
      await addCartItem(variantWithCorrectPrice, productForCart, quantity);
      console.log("Successfully added to cart");
      // Call the onAddToCart callback if provided
      if (onAddToCart) {
        onAddToCart();
      }

      // Open cart modal programmatically
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('open-cart'));

        // Lightweight toast
        const showToast = (msg: string) => {
          const el = document.createElement('div');
          el.textContent = msg;
          el.className = 'fixed left-1/2 top-6 -translate-x-1/2 z-[100] rounded-md bg-green-600 px-4 py-2 text-white shadow-lg';
          document.body.appendChild(el);
          setTimeout(() => {
            el.style.transition = 'opacity 300ms';
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 300);
          }, 1600);
        };
        showToast('Successfully added to cart');

        // Navigate to home and auto-open cart there
        sessionStorage.setItem('openCartOnHome', '1');
      }

      // Small delay so toast is visible before navigating
      setTimeout(() => {
        router.push('/');
      }, 700);
    } catch (error) {
      console.error("Error in handleAddToCart:", error);
    }
  };

  return (
    <form onSubmit={handleAddToCart} className="space-y-3">
      {/* Quantity selector */}
      <div>
        <label className="mb-1 block text-xs tracking-wide text-neutral-600">Quantity</label>
        <div className="inline-flex items-center rounded-md border border-neutral-300 overflow-hidden">
          <button
            type="button"
            onClick={dec}
            className="px-3 py-2 select-none text-lg leading-none hover:bg-neutral-100 disabled:opacity-40"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
          >
            −
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (Number.isNaN(val)) return;
              setQuantity(Math.min(Math.max(1, val), maxQty));
            }}
            className="w-12 text-center outline-none py-2"
            min={1}
            max={maxQty}
            aria-label="Quantity"
          />
          <button
            type="button"
            onClick={inc}
            className="px-3 py-2 select-none text-lg leading-none hover:bg-neutral-100 disabled:opacity-40"
            aria-label="Increase quantity"
            disabled={quantity >= maxQty}
          >
            +
          </button>
        </div>
        {finalVariant && finalVariant.inventoryQuantity !== undefined && (
          <div className="mt-1 text-xs text-neutral-500">Max {maxQty} per order</div>
        )}
      </div>

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
