'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTransition } from 'react';
import type { CartItem } from '@/types/ecommerce.types';
import type { UpdateType } from './cart/cart-context';

export function DeleteItemButton({
  item,
  optimisticUpdate
}: {
  item: CartItem;
  optimisticUpdate: (id: string, action: UpdateType) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const itemId = item.id;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      try {
        // Optimistically update the UI
        optimisticUpdate(itemId, 'delete');
        
        // If you need to make an API call, you can add it here
        // For example, if you have an API endpoint to delete the item
        // await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Error deleting item:', error);
        // You might want to revert the optimistic update here
        // by calling optimisticUpdate again with the previous state
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Remove cart item"
      className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-neutral-500 disabled:opacity-50"
    >
      <XMarkIcon className="mx-[1px] h-4 w-4 text-white dark:text-black" />
    </button>
  );
}
