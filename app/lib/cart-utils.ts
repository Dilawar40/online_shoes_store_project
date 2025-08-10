import { CartItem as ContextCartItem } from '@/app/components/cart/cart-context';
import { CartItem as EcommerceCartItem } from '@/types/ecommerce.types';

/**
 * Maps a cart item from the cart context to the ecommerce cart item type
 * that's expected by the UI components.
 */
export function mapToEcommerceCartItem(item: ContextCartItem): EcommerceCartItem {
  // Create a new object with all the required properties for EcommerceCartItem
  const ecommerceItem: any = {
    ...item,
    id: item.id,
    quantity: item.quantity,
    cost: item.cost || {
      totalAmount: {
        amount: item.price.amount * item.quantity,
        currencyCode: item.price.currencyCode || 'USD',
      },
    },
    merchandise: {
      ...item.variant,
      id: item.variant.id,
      title: item.variant.title || '',
      price: {
        amount: item.price.amount.toString(),
        currencyCode: item.price.currencyCode || 'USD',
      },
      product: {
        id: item.product.id,
        handle: item.product.handle || '',
        title: item.product.title,
        featuredImage: {
          url: item.product.featuredImage?.url || '',
          altText: item.product.images?.[0]?.altText || item.product.title,
          width: 800,
          height: 800,
        },
      },
    },
  };

  return ecommerceItem as EcommerceCartItem;
}
