"use client";

import clsx from "clsx";

import Script from "next/script";
import { Dialog, Transition } from "@headlessui/react";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import {
  Fragment,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useFormStatus } from "react-dom";
import { createCartAndSetCookie, redirectToCheckout } from "./actions";
import { useCart } from "./cart-context";
import type { CartItem as OrderedCartItem } from "./cart-context";
import { mapToEcommerceCartItem } from "@/app/lib/cart-utils";
import LoadingDots from "../loading-dots";
import Price from "../Price";
import { DeleteItemButton } from "../delete-item-button";
import { EditItemQuantityButton } from "../edit-item-quantity-button";
import OpenCart from "./open-cart";
import { createUrl } from "@/app/lib/utils";
import { useRouter } from "next/navigation";

type MerchandiseSearchParams = {
  [key: string]: string;
};

export interface CartModalRef {
  openCart: () => void;
  closeCart: () => void;
}

const CloseCart = ({ className }: { className?: string }) => (
  <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
    <XMarkIcon
      className={clsx(
        "h-6 transition-all ease-in-out hover:scale-110",
        className
      )}
    />
  </div>
);

const CheckoutButton = ({ onBeforeNavigate }: { onBeforeNavigate?: () => void }) => {
  const [loading, setLoading] = useState(false);
  const { cart } = useCart();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) return;
    setLoading(true);
    try {
      // Persist cart for the checkout page to render the summary
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('checkoutCart', JSON.stringify(cart));
      }
      // Close the cart modal before navigating
      onBeforeNavigate?.();
      router.push('/checkout');
    } catch (err) {
      console.error('Checkout navigation error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      {loading ? 'Processing...' : 'Proceed to Payment'}
    </button>
  );
};



// const CheckoutButton = ({ disabled = false }: { disabled?: boolean }) => {
//   const [isPending, setIsPending] = useState(false);
//   const router = useRouter();
//   const { cart } = useCart();

//   const handleCheckout = async () => {
//     if (!cart || !cart.items || cart.items.length === 0) {
//       console.error("Cannot proceed to checkout: Cart is empty");
//       return;
//     }

//     setIsPending(true);
//     const testAmount = 500;
//     try {
//       const orderId = `order_${Date.now()}`;
//       const amount = testAmount;

//       // Call Next.js API
//       const res = await fetch("/api/payments", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ orderId, amount }),
//       });

//       const data = await res.json();
//       console.log("Safepay response:", data);

//       if (data.data?.token) {
//         // Redirect to Safepay Checkout page
//         window.location.href = `https://sandbox.api.getsafepay.com/checkout?token=${data.data.token}`;
//       } else {
//         console.error("Checkout failed:", data);
//       }
//     } catch (error) {
//       console.error("Error during checkout:", error);
//     } finally {
//       setIsPending(false);
//     }
//   };

//   const isDisabled = disabled || isPending || !cart?.items?.length;

//   return (
//     <button
//       onClick={handleCheckout}
//       disabled={isDisabled}
//       className="block w-full rounded-full bg-blue-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100 disabled:opacity-50"
//     >
//       {isPending ? <LoadingDots className="bg-white" /> : "Proceed to Checkout"}
//     </button>
//   );
// };

const CartModal = forwardRef<CartModalRef>((_props, ref) => {
  const { cart, updateCartItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [orderedItems, setOrderedItems] = useState<OrderedCartItem[]>([]);
  const [showOrdered, setShowOrdered] = useState(false);
  const orderedListRef = useRef<HTMLUListElement | null>(null);

  // Debug cart state
  useEffect(() => {
    console.log("🛒 Cart state changed:", {
      hasCart: !!cart,
      cartItems: cart?.items,
      itemsLength: cart?.items?.length,
      totalQuantity: cart?.totalQuantity,
      cart: cart,
    });
  }, [cart]);
  const totalQuantity =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const quantityRef = useRef(totalQuantity);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    if (!cart) {
      console.log("🛒 No cart found → creating new cart...");
      createCartAndSetCookie();
    } else {
      console.log("🛒 Cart loaded:", cart);
    }
  }, [cart]);

  // Load ordered items from sessionStorage (after orders complete)
  useEffect(() => {
    const load = () => {
      if (typeof window === 'undefined') return;
      try {
        const raw = sessionStorage.getItem('orderedItems');
        if (raw) {
          const parsed = JSON.parse(raw);
          const arr = Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []);
          setOrderedItems(arr);
        } else setOrderedItems([]);
      } catch {
        setOrderedItems([]);
      }
    };
    load();
    // refresh when the cart is reset (after order completion)
    if (typeof window !== 'undefined') {
      window.addEventListener('cart:reset', load);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cart:reset', load);
      }
    };
  }, []);

  // No auto-expand; ordered items only show when user toggles the button

  // When showing ordered list or it updates, scroll to top
  useEffect(() => {
    if (showOrdered && orderedListRef.current) {
      try { orderedListRef.current.scrollTop = 0; } catch {}
    }
  }, [showOrdered, orderedItems]);

  const clearOrderedItems = () => {
    if (typeof window !== 'undefined') {
      try { sessionStorage.removeItem('orderedItems'); } catch {}
    }
    setOrderedItems([]);
    setShowOrdered(false);
  };

  // Removed auto-open functionality to prevent cart from opening on page load
  // You can re-enable this if you want the cart to open when items are added
  // while the cart is closed
  useEffect(() => {
    if (cart?.totalQuantity) {
      quantityRef.current = cart.totalQuantity;
    }
  }, [cart?.totalQuantity]);

  // Expose open/close methods to parent components
  useImperativeHandle(ref, () => ({
    openCart,
    closeCart,
  }));

  // Allow opening cart from anywhere
  useEffect(() => {
    const handler = () => openCart();
    if (typeof window !== 'undefined') {
      window.addEventListener('open-cart', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('open-cart', handler);
      }
    };
  }, []);

  // Open automatically if flag set (e.g., after redirect)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const flag = sessionStorage.getItem('openCartOnHome');
    if (flag === '1') {
      sessionStorage.removeItem('openCartOnHome');
      openCart();
    }
  }, []);

  return (
    <>
      <button aria-label="Open cart" onClick={openCart}>
        <OpenCart quantity={cart?.totalQuantity} />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl md:w-[390px] dark:border-neutral-700 dark:bg-black/80 dark:text-white">
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-semibold">My Cart</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowOrdered((v) => !v)}
                    disabled={!orderedItems?.length}
                    className="rounded border border-neutral-300 px-2 py-1 text-xs disabled:opacity-50 dark:border-neutral-700"
                    title={orderedItems?.length ? "View ordered items" : "No ordered items yet"}
                  >
                    {showOrdered ? 'Hide ordered items' : 'Show ordered items'}{orderedItems?.length ? ` (${orderedItems.length})` : ''}
                  </button>
                  <button aria-label="Close cart" onClick={closeCart}>
                    <CloseCart />
                  </button>
                </div>
              </div>

              {!cart ||
                !Array.isArray(cart.items) ||
                cart.items.length === 0 ? (
                showOrdered && orderedItems?.length ? (
                  <div className="mt-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">Ordered items</p>
                      <button onClick={clearOrderedItems} className="text-xs text-blue-600 hover:underline">Clear</button>
                    </div>
                    <ul ref={orderedListRef} className="max-h-80 space-y-3 overflow-auto">
                      {orderedItems.map((item, i) => (
                        <li key={`ordered-empty-${i}`} className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-2 last:border-b-0 dark:border-neutral-700">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded border border-neutral-300 dark:border-neutral-700">
                              <Image
                                className="h-full w-full object-cover"
                                width={40}
                                height={40}
                                alt={item.product.images?.[0]?.altText || item.product.title}
                                src={item.product.images?.[0]?.url || "/placeholder-product.jpg"}
                              />
                            </div>
                            <div className="leading-tight">
                              <p className="text-sm font-medium">{item.product.title}</p>
                              <p className="text-xs text-neutral-500">{item.variant?.title}</p>
                              <p className="text-[10px] text-neutral-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <Price
                            className="text-sm"
                            amount={item.price.amount * item.quantity}
                            currencyCode={item.price.currencyCode}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                    <ShoppingCartIcon className="h-16" />
                    <p className="mt-6 text-center text-2xl font-bold">
                      Your cart is empty.
                    </p>
                  </div>
                )
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                  <ul className="grow overflow-auto py-4">
                    {cart.items
                      .filter((item) => item?.product) // Filter out any null/undefined items
                      .sort(
                        (a, b) =>
                          a.product?.title?.localeCompare(
                            b.product?.title || ""
                          ) || 0
                      )
                      .map((item, i) => {
                        if (!item) {
                          console.warn("Undefined item in cart at index", i);
                          return null;
                        }
                        console.log(`🛍️ Rendering cart item [${i}]`, item);

                        const merchandiseSearchParams =
                          {} as MerchandiseSearchParams;

                        if (item.variant?.selectedOptions) {
                          item.variant.selectedOptions.forEach(
                            ({ name, value }) => {
                              if (name && value) {
                                merchandiseSearchParams[name.toLowerCase()] =
                                  value;
                              }
                            }
                          );
                        }

                        const productUrl = createUrl(
                          `/product/${item.product?.handle || ""}`,
                          new URLSearchParams(merchandiseSearchParams)
                        );

                        // Get variant options (color, size, etc.)
                        const variantOptions = item.variant?.selectedOptions
                          ?.filter(
                            (option) => option && option.name && option.value
                          )
                          ?.map((option) => {
                            // For size options that contain slashes, only show the selected size
                            if (
                              (option.name.toLowerCase() === "size" ||
                                option.name.toLowerCase() === "sizes") &&
                              option.value.includes("/")
                            ) {
                              // If we have a selected size in the variant, use that
                              const selectedSize =
                                item.variant.selectedOptions?.find(
                                  (opt) =>
                                    opt.name.toLowerCase() ===
                                    option.name.toLowerCase()
                                )?.value;
                              return `${option.name}: ${selectedSize ||
                                option.value.split("/")[0].trim()
                                }`;
                            }
                            return `${option.name}: ${option.value}`;
                          })
                          .join(" / ");

                        console.log("🔎 Item details:", {
                          title: item.product?.title || "No title",
                          url: productUrl,
                          options: variantOptions || "No options",
                          quantity: item.quantity || 0,
                          price: item.price || {
                            amount: 0,
                            currencyCode: "USD",
                          },
                        });

                        if (!item.product) {
                          console.error("Item is missing product data:", item);
                          return null;
                        }

                        return (
                          <li
                            key={i}
                            className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
                          >
                            <div className="relative flex w-full flex-row justify-between px-1 py-4">
                              <div className="absolute z-40 -ml-1 -mt-2">
                                <DeleteItemButton
                                  item={mapToEcommerceCartItem(item)}
                                  optimisticUpdate={updateCartItem}
                                />
                              </div>
                              <div className="flex flex-row gap-4">
                                <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                  <Image
                                    className="h-full w-full object-cover"
                                    width={64}
                                    height={64}
                                    alt={
                                      item.product.images[0]?.altText ||
                                      item.product.title
                                    }
                                    src={
                                      item.product.images[0]?.url ||
                                      "/placeholder-product.jpg"
                                    }
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <Link
                                    href={productUrl}
                                    onClick={closeCart}
                                    className="font-medium hover:underline"
                                  >
                                    {item.product.title}
                                  </Link>
                                  {variantOptions && (
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                      {variantOptions}
                                    </p>
                                  )}
                                  <Price
                                    className="mt-1 text-sm"
                                    amount={item.price.amount}
                                    currencyCode={item.price.currencyCode}
                                  />
                                </div>
                              </div>
                              <div className="flex h-16 flex-col justify-between">
                                <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                  <EditItemQuantityButton
                                    item={mapToEcommerceCartItem(item)}
                                    type="minus"
                                    optimisticUpdate={updateCartItem}
                                  />
                                  <p className="w-6 text-center">
                                    <span className="w-full text-sm">
                                      {item.quantity}
                                    </span>
                                  </p>
                                  <EditItemQuantityButton
                                    item={mapToEcommerceCartItem(item)}
                                    type="plus"
                                    optimisticUpdate={updateCartItem}
                                  />
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                  {/* Ordered items (recently purchased) - toggled */}
                  {showOrdered && orderedItems?.length ? (
                    <div className="mt-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold">Ordered items</p>
                        <button onClick={clearOrderedItems} className="text-xs text-blue-600 hover:underline">Clear</button>
                      </div>
                      <ul ref={orderedListRef} className="max-h-80 space-y-3 overflow-auto">
                        {orderedItems.map((item, i) => (
                          <li key={`ordered-${i}`} className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-2 last:border-b-0 dark:border-neutral-700">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 overflow-hidden rounded border border-neutral-300 dark:border-neutral-700">
                                <Image
                                  className="h-full w-full object-cover"
                                  width={40}
                                  height={40}
                                  alt={item.product.images?.[0]?.altText || item.product.title}
                                  src={item.product.images?.[0]?.url || "/placeholder-product.jpg"}
                                />
                              </div>
                              <div className="leading-tight">
                                <p className="text-sm font-medium">{item.product.title}</p>
                                <p className="text-xs text-neutral-500">{item.variant?.title}</p>
                                <p className="text-[10px] text-neutral-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <Price
                              className="text-sm"
                              amount={item.price.amount * item.quantity}
                              currencyCode={item.price.currencyCode}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 dark:border-neutral-700">
                      <p>Subtotal</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={cart.total}
                        currencyCode={
                          cart.items[0]?.price.currencyCode || "USD"
                        }
                      />
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Taxes</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={cart.cost?.totalTaxAmount?.amount || "0"}
                        currencyCode={
                          cart.cost?.totalTaxAmount?.currencyCode || "USD"
                        }
                      />
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Shipping</p>
                      <p className="text-right">Calculated at checkout</p>
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p className="font-semibold">Total</p>
                      <Price
                        className="text-right text-base font-semibold text-black dark:text-white"
                        amount={
                          cart.cost?.totalAmount?.amount || cart.total || "0"
                        }
                        currencyCode={
                          cart.cost?.totalAmount?.currencyCode ||
                          cart.items[0]?.price.currencyCode ||
                          "USD"
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <CheckoutButton onBeforeNavigate={closeCart} />
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
});

CartModal.displayName = "CartModal";

export default CartModal;
