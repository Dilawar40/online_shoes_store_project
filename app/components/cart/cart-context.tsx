"use client";

import { createContext, useContext, useReducer, useEffect, useMemo } from "react";

import { Product } from "@/app/lib/constants";
import { supabase } from "@/lib/supabase";

type ProductVariant = {
  id: string;
  title: string;
  price: { amount: number; currencyCode: string };
  selectedOptions?: Array<{ name: string; value: string }>;
};

export type UpdateType = "plus" | "minus" | "delete";

export type CartItem = {
  id: string;
  variant: ProductVariant;
  product: Product;
  quantity: number;
  price: { amount: number; currencyCode: string };
};

type Cart = {
  id?: string;
  items: CartItem[];
  totalQuantity: number;
  total: number;
  cost?: {
    totalAmount: {
      amount: number;
      currencyCode: string;
    };
    subtotalAmount: {
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
  | { type: "SET_CART"; payload: Cart }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_ITEM"; payload: { id: string; updateType: UpdateType } };

const CartContext = createContext<{
  cart: Cart;
  addCartItem: (variant: ProductVariant, product: Product, quantity?: number) => Promise<void>;
  updateCartItem: (id: string, updateType: UpdateType) => Promise<void>;
} | null>(null);

const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case "SET_CART":
      return {
        ...action.payload,
        cost: action.payload.cost || {
          totalAmount: {
            amount: action.payload.total,
            currencyCode: action.payload.items[0]?.price.currencyCode || 'USD',
          },
          subtotalAmount: {
            amount: action.payload.total,
            currencyCode: action.payload.items[0]?.price.currencyCode || 'USD',
          },
          totalTaxAmount: {
            amount: 0, // Default to 0 for tax
            currencyCode: action.payload.items[0]?.price.currencyCode || 'USD',
          },
        },
      };
    case "ADD_ITEM":
      const newTotal = state.total + action.payload.price.amount;
      return {
        ...state,
        items: [...state.items, action.payload],
        totalQuantity: state.totalQuantity + 1,
        total: newTotal,
        cost: {
          totalAmount: {
            amount: newTotal,
            currencyCode: action.payload.price.currencyCode || 'USD',
          },
          subtotalAmount: {
            amount: newTotal,
            currencyCode: action.payload.price.currencyCode || 'USD',
          },
          totalTaxAmount: {
            amount: 0, // Default to 0 for tax
            currencyCode: action.payload.price.currencyCode || 'USD',
          },
        },
      };
    case "UPDATE_ITEM": {
      const { id, updateType } = action.payload;
      let updatedItems = [...state.items];
      const idx = updatedItems.findIndex((i) => i.id === id);
      if (idx === -1) return state;

      if (updateType === "plus") {
        updatedItems[idx].quantity++;
      } else if (updateType === "minus") {
        updatedItems[idx].quantity--;
        if (updatedItems[idx].quantity <= 0) updatedItems.splice(idx, 1);
      } else if (updateType === "delete") {
        updatedItems.splice(idx, 1);
      }

      const totalQuantity = updatedItems.reduce((s, i) => s + i.quantity, 0);
      const total = updatedItems.reduce((s, i) => s + i.price.amount * i.quantity, 0);
      const currencyCode = updatedItems[0]?.price.currencyCode || 'USD';

      return {
        ...state,
        items: updatedItems,
        totalQuantity,
        total,
        cost: {
          totalAmount: {
            amount: total,
            currencyCode,
          },
          subtotalAmount: {
            amount: total,
            currencyCode,
          },
          totalTaxAmount: {
            amount: 0, // Default to 0 for tax
            currencyCode,
          },
        },
      };
    }
    default:
      return state;
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    totalQuantity: 0,
    total: 0,
  });

  // Initialize cart from localStorage for unauthenticated users
  const getLocalCart = (): Cart => {
    if (typeof window === 'undefined') return { items: [], totalQuantity: 0, total: 0 };
    const savedCart = localStorage.getItem('localCart');
    return savedCart ? JSON.parse(savedCart) : { items: [], totalQuantity: 0, total: 0 };
  };

  const saveLocalCart = (cart: Cart) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('localCart', JSON.stringify(cart));
    }
  };

  const fetchCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // For unauthenticated users, use localStorage
      const localCart = getLocalCart();
      dispatch({ type: "SET_CART", payload: localCart });
      return;
    }

    try {
      if (!cart.id) return;
      
      // Load items
      const { data: items, error: itemsError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", cart.id);

      if (itemsError) throw itemsError;

      const cartData = {
        id: cart.id,
        items: items || [],
        totalQuantity: items?.reduce((s, i) => s + i.quantity, 0) || 0,
        total: items?.reduce((s, i) => s + i.price.amount * i.quantity, 0) || 0,
      };

      dispatch({ type: "SET_CART", payload: cartData });
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  // Initialize cart on mount
  useEffect(() => {
    const initializeCart = async () => {
      console.log('Initializing cart...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For unauthenticated users, use localStorage
        console.log('No user found, using localStorage cart');
        const localCart = getLocalCart();
        console.log('Loaded cart from localStorage:', localCart);
        dispatch({ type: "SET_CART", payload: localCart });
        return;
      }

      // For authenticated users, fetch from database
      try {
        console.log('User found, fetching cart from database...');
        
        // Ensure cart exists
        const { data: cartRow, error: cartError } = await supabase
          .from("carts")
          .select("*")
          .eq("user_id", user.id)
          .single();

        let cartId = cartRow?.id;
        
        if (!cartId) {
          console.log('No existing cart found, creating a new one...');
          const { data: newCart, error: createError } = await supabase
            .from("carts")
            .insert({ user_id: user.id })
            .select()
            .single();
            
          if (createError) throw createError;
          
          cartId = newCart.id;
          console.log('New cart created with ID:', cartId);
        }

        // Load items
        const { data: items, error: itemsError } = await supabase
          .from("cart_items")
          .select("*")
          .eq("cart_id", cartId);

        if (itemsError) throw itemsError;

        // Transform items to match CartItem type
        const cartItems: CartItem[] = (items || []).map(item => ({
          id: item.id,
          variant: {
            id: item.variant_id,
            title: item.variant?.title || 'Default',
            price: item.price,
            selectedOptions: item.variant?.selectedOptions || []
          },
          product: item.product,
          quantity: item.quantity,
          price: item.price
        }));

        const cartData = {
          id: cartId,
          items: cartItems,
          totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          total: cartItems.reduce((sum, item) => sum + (item.price.amount * item.quantity), 0),
        };
        
        console.log('Loaded cart from database:', cartData);

        dispatch({ type: "SET_CART", payload: cartData });

        // Subscribe to realtime updates
        const channel = supabase
          .channel("cart-changes")
          .on(
            "postgres_changes",
            { 
              event: "*", 
              schema: "public", 
              table: "cart_items", 
              filter: `cart_id=eq.${cartId}` 
            },
            fetchCart
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error initializing cart:', error);
      }
    };

    initializeCart();
  }, []);

  // Listen to global reset events (e.g., after order completion)
  useEffect(() => {
    const handler = () => {
      const empty = { items: [], totalQuantity: 0, total: 0 } as Cart;
      dispatch({ type: "SET_CART", payload: empty });
      // Also clear guest cart storage
      try { if (typeof window !== 'undefined') localStorage.removeItem('localCart'); } catch {}
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('cart:reset', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cart:reset', handler);
      }
    };
  }, []);

  const addCartItem = async (variant: ProductVariant, product: Product, quantity: number = 1): Promise<void> => {
    console.log('addCartItem called with:', { variant, product, cart });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // For unauthenticated users, use localStorage
      const existingItemIndex = cart.items.findIndex(
        item => item.variant.id === variant.id
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        updatedItems = [...cart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
      } else {
        // Add new item
        const newItem = {
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          variant,
          product,
          quantity: Math.max(1, quantity),
          price: variant.price,
        };
        updatedItems = [...cart.items, newItem];
      }
      
      const updatedCart = {
        ...cart,
        items: updatedItems,
        totalQuantity: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        total: updatedItems.reduce((sum, item) => sum + (item.price.amount * item.quantity), 0),
      };
      
      console.log('Updated local cart:', updatedCart);
      dispatch({ type: "SET_CART", payload: updatedCart });
      saveLocalCart(updatedCart);
      return;
    }

    // For authenticated users, use the database
    try {
      if (!cart.id) {
        // Create a new cart if one doesn't exist
        const { data: newCart, error: createCartError } = await supabase
          .from("carts")
          .insert({ user_id: user.id })
          .select()
          .single();
          
        if (createCartError) throw createCartError;
        
        // Update local cart with new ID
        dispatch({ 
          type: "SET_CART", 
          payload: { ...cart, id: newCart.id } 
        });
      }

      // Add item to cart in database
      const { data, error } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cart.id,
          variant_id: variant.id,
          product,
          variant,
          quantity: Math.max(1, quantity),
          price: variant.price,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Item added to database:', data);

      // Update local state with the newly added item
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: data.id,
          variant,
          product,
          quantity: Math.max(1, quantity),
          price: variant.price,
        },
      });
    } catch (error) {
      console.error('Error in addCartItem:', error);
    }
  };

  const updateCartItem = async (id: string, updateType: UpdateType) => {
    const { data: { user } } = await supabase.auth.getUser();
    const item = cart.items.find((i) => i.id === id);
    if (!item) return;

    if (!user) {
      // For unauthenticated users, update local storage
      let updatedItems = [...cart.items];
      const itemIndex = updatedItems.findIndex(i => i.id === id);
      
      if (itemIndex === -1) return;
      
      if (updateType === "plus") {
        updatedItems[itemIndex].quantity += 1;
      } else if (updateType === "minus") {
        if (updatedItems[itemIndex].quantity > 1) {
          updatedItems[itemIndex].quantity -= 1;
        } else {
          updatedItems = updatedItems.filter(i => i.id !== id);
        }
      } else if (updateType === "delete") {
        updatedItems = updatedItems.filter(i => i.id !== id);
      }
      
      const updatedCart = {
        ...cart,
        items: updatedItems,
        totalQuantity: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
        total: updatedItems.reduce((sum, i) => sum + (i.price.amount * i.quantity), 0),
      };
      
      dispatch({ type: "SET_CART", payload: updatedCart });
      saveLocalCart(updatedCart);
      return;
    }

    // For authenticated users, update the database
    try {
      if (updateType === "plus") {
        await supabase
          .from("cart_items")
          .update({ quantity: item.quantity + 1 })
          .eq("id", id);
      } else if (updateType === "minus") {
        if (item.quantity > 1) {
          await supabase
            .from("cart_items")
            .update({ quantity: item.quantity - 1 })
            .eq("id", id);
        } else {
          await supabase.from("cart_items").delete().eq("id", id);
        }
      } else if (updateType === "delete") {
        await supabase.from("cart_items").delete().eq("id", id);
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const value = useMemo(
    () => ({ cart, addCartItem, updateCartItem }),
    [cart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
