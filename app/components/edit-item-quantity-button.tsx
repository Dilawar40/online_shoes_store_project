"use client";

import { CartItem } from "@/types/ecommerce.types";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useCart } from "./cart/cart-context";

function SubmitButton({ type, disabled }: { type: "plus" | "minus"; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={
        type === "plus" ? "Increase item quantity" : "Reduce item quantity"
      }
      disabled={disabled}
      className={clsx(
        "ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80",
        {
          "ml-auto": type === "minus",
          "opacity-50 cursor-not-allowed": disabled,
          "hover:opacity-100": !disabled,
        }
      )}
    >
      {type === "plus" ? (
        <PlusIcon className="h-4 w-4 dark:text-neutral-500" />
      ) : (
        <MinusIcon className="h-4 w-4 dark:text-neutral-500" />
      )}
    </button>
  );
}

export function EditItemQuantityButton({
  item,
  type,
  optimisticUpdate,
}: {
  item: CartItem;
  type: "plus" | "minus";
  optimisticUpdate: (id: string, type: "plus" | "minus" | "delete") => Promise<void>;
}) {
  const handleClick = async () => {
    try {
      // Pass the item ID and the update type to the optimistic update function
      await optimisticUpdate(item.id, type);
    } catch (error) {
      console.error('Error updating item quantity:', error);
    }
  };

  // Disable minus button if quantity is 1
  const isMinusDisabled = type === 'minus' && item.quantity <= 1;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isMinusDisabled}
        className={clsx(
          "ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200",
          {
            "ml-auto": type === "minus",
            "opacity-50 cursor-not-allowed": isMinusDisabled,
            "hover:opacity-80 hover:border-neutral-800": !isMinusDisabled,
          }
        )}
      >
        {type === "plus" ? (
          <PlusIcon className="h-4 w-4 dark:text-neutral-500" />
        ) : (
          <MinusIcon className="h-4 w-4 dark:text-neutral-500" />
        )}
      </button>
    </div>
  );
}
