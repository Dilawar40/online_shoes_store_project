// Add the 'use client' directive at the top of the file
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product, staticProducts } from "@/app/lib/constants";
import clsx from "clsx";
import Image from "next/image";
import Label from "../Label";

// Custom hook to detect screen size
function useScreenSize() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return { isMobile, isTablet };
}

function ThreeItemGridItem({
  item,
  size,
  priority,
}: {
  item: Product;
  size: "full" | "half";
  priority?: boolean;
}) {
  const isFull = size === "full";

  return (
    <div
      className={clsx(
        isFull ? "md:col-span-4 md:row-span-2" : "md:col-span-2 md:row-span-1",
        "sm:col-span-1 sm:row-span-1", // Ensure full width on mobile screens
        "w-full h-full"
      )}
    >
      <Link
        href={`/product/${item?.handle || "#"}`}
        prefetch={!!item?.handle}
        className={clsx(
          "relative block w-full h-full",
          !isFull ? "aspect-square" : ""
        )}
      >
        <GridTileImage
          src={item?.featuredImage?.url || "/placeholder-image.jpg"}
          fill
          sizes={
            isFull
              ? "(min-width: 768px) 66vw, 100vw"
              : "(min-width: 768px) 33vw, 100vw"
          }
          priority={priority}
          alt={item?.title || "Product image"}
          label={{
            position: isFull ? "center" : "bottom",
            title: item?.title || "Product",
            amount: item?.priceRange?.maxVariantPrice?.amount || 0,
            currencyCode:
              item?.priceRange?.maxVariantPrice?.currencyCode || "Rs.",
          }}
        />
      </Link>
    </div>
  );
}

export default function ThreeItemGrid() {
  // Ensure staticProducts is an array
  if (!Array.isArray(staticProducts)) {
    console.error("staticProducts is not an array:", staticProducts);
    return null;
  }

  // Filter and validate products
  const homepageItems = staticProducts
    .filter(
      (
        product
      ): product is Product & {
        handle: string;
        featuredImage?: { url: string };
        title?: string;
      } => {
        const isValid =
          !!product?.handle &&
          (product?.featuredImage?.url || "").startsWith("/");
        if (!isValid) {
          console.warn("Invalid product data:", product);
        }
        return isValid;
      }
    )
    .slice(0, 3);

  if (homepageItems.length === 0) {
    console.error("No valid products found with required properties");
    return (
      <div className="w-full text-center p-4">
        <p>No products available at the moment.</p>
      </div>
    );
  }

  const [firstProduct, secondProduct, thirdProduct] = homepageItems;
  const { isMobile, isTablet } = useScreenSize();
  
  // Determine the size of the first item based on screen size
  const getFirstItemSize = () => {
    if (isMobile) return 'half';
    if (isTablet) return 'full';
    return 'full'; // Default for desktop
  };
  
  const firstItemSize = getFirstItemSize();

  return (
    <section className="mx-auto grid max-w-[--breakpoint-2xl] gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2 lg:max-h-[calc(100vh-200px)]">
      <ThreeItemGridItem 
        size={firstItemSize} 
        item={firstProduct} 
        priority={true} 
      />
      <ThreeItemGridItem 
        size="half" 
        item={secondProduct} 
        priority={true} 
      />
      <ThreeItemGridItem 
        size="half" 
        item={thirdProduct} 
      />
    </section>
  );
}

export function GridTileImage({
  isInteractive = true,
  active,
  label,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: number;
    currencyCode: string;
    position?: 'bottom' | 'center';
  };
} & React.ComponentProps<typeof Image>) {
  return (
    <div
      className={clsx(
        'group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black',
        {
          relative: label,
          'border-2 border-blue-600': active,
          'border-neutral-200 dark:border-neutral-800': !active
        }
      )}
    >
      {props.src ? (
        <Image
          className={clsx('relative h-full w-full object-contain', {
            'transition duration-300 ease-in-out group-hover:scale-105': isInteractive
          })}
          {...props}
        />
      ) : null}
      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
        />
      ) : null}
    </div>
  );
}