'use client';

import { createContext, useContext, useReducer, useMemo } from 'react';
import { Product } from '@/app/lib/constants';

type ProductVariant = {
  id: string;
  title: string;
  price: {
    amount: number;
    currencyCode: string;
  };
  selectedOptions?: Array<{ name: string; value: string }>;
};

export type UpdateType = 'plus' | 'minus' | 'delete';

export type CartItem = {
  id: string;
  quantity: number;
  price: {
    amount: number;
    currencyCode: string;
  };
  variant: ProductVariant;
  product: Product;
  cost?: {
    totalAmount: {
      amount: number;
      currencyCode: string;
    };
  };
  merchandise?: any; // For backward compatibility
};

type Cart = {
  items: CartItem[];
  totalQuantity: number;
  total: number;
  cost: {
    totalAmount: {
      amount: number;
      currencyCode: string;
    };
    totalTaxAmount: {
      amount: number;
      currencyCode: string;
    };
  };
};

type CartAction =
  | {
      type: 'ADD_ITEM';
      payload: { variant: ProductVariant; product: Product };
    }
  | {
      type: 'UPDATE_ITEM';
      payload: { variantId: string; updateType: UpdateType };
    };

const CartContext = createContext<{
  cart: Cart;
  addCartItem: (variant: ProductVariant, product: Product) => void;
  updateCartItem: (variantId: string, updateType: UpdateType) => void;
} | undefined>(undefined);

const calculateCartCost = (items: CartItem[]): { totalAmount: number; totalTaxAmount: number } => {
  const subtotal = items.reduce((sum, item) => sum + (item.price.amount * item.quantity), 0);
  // Calculate tax (assuming 10% tax rate, adjust as needed)
  const taxRate = 0.10;
  const totalTaxAmount = subtotal * taxRate;
  const totalAmount = subtotal + totalTaxAmount;
  
  return {
    totalAmount,
    totalTaxAmount
  };
};

const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { variant, product } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.variant.id === variant.id
      );

      let updatedItems: CartItem[];
      let newTotalQuantity: number;
      let newTotal: number;

      if (existingItemIndex >= 0) {
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        newTotalQuantity = state.totalQuantity + 1;
        newTotal = state.total + Number(variant.price.amount);
      } else {
        const newItem: CartItem = {
          id: `item-${Date.now()}`,
          variant,
          product,
          quantity: 1,
          price: {
            amount: Number(variant.price.amount),
            currencyCode: variant.price.currencyCode || 'PKR',
          },
        };
        updatedItems = [...state.items, newItem];
        newTotalQuantity = state.totalQuantity + 1;
        newTotal = state.total + Number(variant.price.amount);
      }

      const { totalAmount, totalTaxAmount } = calculateCartCost(updatedItems);

      return { 
        ...state, 
        items: updatedItems,
        totalQuantity: newTotalQuantity,
        total: newTotal,
        cost: {
          totalAmount: {
            amount: totalAmount,
            currencyCode: 'PKR' // Or get from first item's currency
          },
          totalTaxAmount: {
            amount: totalTaxAmount,
            currencyCode: 'PKR' // Or get from first item's currency
          }
        }
      };
    }
    
    case 'UPDATE_ITEM': {
      const { variantId, updateType } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) => item.variant.id === variantId
      );

      if (existingItemIndex === -1) return state;

      const existingItem = state.items[existingItemIndex];
      const updatedItems = [...state.items];
      let quantityChange = 0;
      let newTotal = state.total;

      if (updateType === 'delete') {
        quantityChange = -existingItem.quantity;
        updatedItems.splice(existingItemIndex, 1);
        newTotal -= existingItem.price.amount * existingItem.quantity;
      } else if (updateType === 'plus') {
        quantityChange = 1;
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + 1,
        };
        newTotal += existingItem.price.amount;
      } else if (updateType === 'minus') {
        if (existingItem.quantity > 1) {
          quantityChange = -1;
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity - 1,
          };
          newTotal -= existingItem.price.amount;
        } else {
          quantityChange = -1;
          updatedItems.splice(existingItemIndex, 1);
          newTotal -= existingItem.price.amount;
        }
      }

      const { totalAmount, totalTaxAmount } = calculateCartCost(updatedItems);

      return { 
        ...state, 
        items: updatedItems,
        totalQuantity: Math.max(0, state.totalQuantity + quantityChange),
        total: state.total + (updateType === 'plus' ? existingItem.price.amount : -existingItem.price.amount)
      };
    }

    default:
      return state;
  }
};

export function CartProvider({ 
  children,
  cartPromise
}: { 
  children: React.ReactNode;
  cartPromise?: Promise<Cart>;
}) {
  const [cart, dispatch] = useReducer(cartReducer, { 
    items: [], 
    totalQuantity: 0, 
    total: 0,
    cost: {
      totalAmount: {
        amount: 0,
        currencyCode: 'PKR'
      },
      totalTaxAmount: {
        amount: 0,
        currencyCode: 'PKR'
      }
    }
  });

  // If we have a cartPromise (for server-side), we can use it here
  // For now, we'll just use the client-side cart

  const value = useMemo(() => ({
    cart,
    addCartItem: (variant: ProductVariant, product: Product) => 
      dispatch({ type: 'ADD_ITEM', payload: { variant, product } }),
    updateCartItem: (variantId: string, updateType: UpdateType) => 
      dispatch({ type: 'UPDATE_ITEM', payload: { variantId, updateType } })
  }), [cart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export const createEmptyCart = (): Cart => ({
  items: [],
  totalQuantity: 0,
  total: 0,
  cost: {
    totalAmount: {
      amount: 0,
      currencyCode: 'PKR'
    },
    totalTaxAmount: {
      amount: 0,
      currencyCode: 'PKR'
    }
  }
});
