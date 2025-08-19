"use client";

import { startTransition } from "react";
import clsx from "clsx";
import { useProduct, useUpdateURL } from "./product-context";
import type { ProductOption } from "@/types/ecommerce.types";
import type { Variant as ProductVariantType } from "@/app/lib/constants";

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean;
};

export function VariantSelector({
  options = [],
  variants = [],
}: {
  options: ProductOption[];
  variants: ProductVariantType[];
}) {
  const { state, updateOption } = useProduct();
  const updateURL = useUpdateURL();

  const hasNoOptionsOrJustOneOption =
    !options.length ||
    (options.length === 1 && options[0]?.values.length === 1);

  if (hasNoOptionsOrJustOneOption) return null;

  // ✅ Build normalized variant combinations
  const combinations: Combination[] = variants.map((variant) => ({
    id: variant.id,
    availableForSale:
      variant.availableForSale !== undefined ? variant.availableForSale : true,
    ...(variant.selectedOptions || []).reduce(
      (accumulator, option) => ({
        ...accumulator,
        [option.name.toLowerCase()]: option.value,
      }),
      {}
    ),
  }));

  return options.map((option) => {
    // If this is a size option and values contain a single string with slashes, split it
    const isSizeOption = option.name.toLowerCase() === 'size' || option.name.toLowerCase() === 'sizes';
    const values = isSizeOption && option.values.length === 1 && option.values[0].includes('/')
      ? option.values[0].split('/').map(v => v.trim())
      : option.values;

    return (
      <form key={option.id}>
        <dl className="mb-8">
          <dt className="mb-4 text-sm uppercase tracking-wide">
            {option.name} (values: {values.length})
          </dt>
          <dd className="flex flex-wrap gap-3">
            {values.map((value) => {
            const optionNameLowerCase = option.name.toLowerCase();

            // Create hypothetical selection if user picks this value
            const hypothetical = { ...state, [optionNameLowerCase]: value };

            // Check if this value is available
            let isAvailableForSale = false;

            // If this option has only one value → always available
            if (values.length === 1) {
              isAvailableForSale = true;
            } else {
              isAvailableForSale = combinations.some((combination) => {
                return (
                  Object.entries(hypothetical).every(([key, val]) => {
                    // allow skipping the option currently being tested
                    return (
                      combination[key] === val || key === optionNameLowerCase
                    );
                  }) && combination.availableForSale
                );
              });
            }

            const isActive = state[optionNameLowerCase] === value;

            return (
              <button
                type="button"
                onClick={() => {
                  startTransition(() => {
                    const newState = updateOption(optionNameLowerCase, value);
                    updateURL(newState);
                  });
                }}
                key={value}
                aria-disabled={!isAvailableForSale}
                disabled={!isAvailableForSale}
                title={`${option.name} ${value}${
                  !isAvailableForSale ? " (Out of Stock)" : ""
                }`}
                className={clsx(
                  "flex min-w-[48px] items-center justify-center rounded-full border bg-neutral-100 px-2 py-1 text-sm dark:border-neutral-800 dark:bg-neutral-900",
                  {
                    "cursor-default ring-2 ring-blue-600": isActive,
                    "ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-blue-600":
                      !isActive && isAvailableForSale,
                    "relative z-10 cursor-not-allowed overflow-hidden bg-neutral-100 text-neutral-500 ring-1 ring-neutral-300 before:absolute before:inset-x-0 before:-z-10 before:h-px before:-rotate-45 before:bg-neutral-300 before:transition-transform dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700 dark:before:bg-neutral-700":
                      !isAvailableForSale,
                  }
                )}
              >
                {value}
              </button>
            );
          })}
            </dd>
          </dl>
        </form>
      );
    });
}
