"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/ecommerce.types';
import { formatPrice } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const { id, title, handle, price, featuredImage, variants = [] } = product;
  
  // Use the product price for display and the first variant's compareAtPrice if present
  const displayPrice = price; // { amount: number, currencyCode: string }
  const displayCompareAtPrice = variants[0]?.compareAtPrice; // { amount: string, currencyCode: string } | undefined
  
  // Check if product is on sale
  const isOnSale = !!(
    displayCompareAtPrice && Number(displayCompareAtPrice.amount) > Number(displayPrice.amount)
  );
  
  // Build gallery from product images (fallback to variant/featured image)
  const gallery = useMemo(() => {
    const imgs: Array<{ url: string; altText?: string }> = [];
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img?.url) imgs.push({ url: img.url, altText: img.altText });
      }
    }
    if (imgs.length === 0) {
      const fallback = variants[0]?.image || featuredImage;
      if (fallback?.url) imgs.push({ url: fallback.url, altText: fallback.altText });
    }
    if (imgs.length === 0) {
      imgs.push({ url: '/placeholder-product.jpg', altText: title });
    }
    return imgs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.images, variants, featuredImage, title]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Reset index if gallery changes size
  useEffect(() => {
    setCurrentIdx(0);
  }, [gallery.length]);

  // Mobile-only auto-rotate when at least 50% visible
  useEffect(() => {
    if (!containerRef.current) return;
    if (gallery.length <= 1) return; // nothing to rotate

    const mql = window.matchMedia('(max-width: 640px)'); // Tailwind's sm breakpoint

    const clearTicker = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const startTicker = () => {
      if (intervalRef.current || gallery.length <= 1) return;
      intervalRef.current = setInterval(() => {
        setCurrentIdx((i) => (i + 1) % gallery.length);
      }, 2500);
    };

    const handleVisibility = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      const halfVisible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      if (mql.matches && halfVisible) {
        startTicker();
      } else {
        clearTicker();
      }
    };

    const setupObserver = () => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver(handleVisibility, {
        threshold: [0, 0.25, 0.5, 0.75, 1],
      });
      if (containerRef.current) observerRef.current.observe(containerRef.current);
    };

    setupObserver();

    const handleMqlChange = () => {
      // On breakpoint change, stop ticker if leaving mobile
      if (!mql.matches) {
        clearTicker();
      }
      // Re-evaluate visibility immediately
      if (observerRef.current && containerRef.current) {
        observerRef.current.unobserve(containerRef.current);
        observerRef.current.observe(containerRef.current);
      }
    };

    mql.addEventListener?.('change', handleMqlChange);

    return () => {
      clearTicker();
      mql.removeEventListener?.('change', handleMqlChange);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [gallery.length]);

  const imageUrl = gallery[currentIdx]?.url || '/placeholder-product.jpg';
  const altText = gallery[currentIdx]?.altText || title;
  
  return (
    <div className="group relative" ref={containerRef}>
      {/* Big image is clickable (navigates) */}
      <Link href={`/product/${handle || id}`} className="block">
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75">
          <Image
            src={imageUrl}
            alt={altText}
            width={400}
            height={400}
            className="h-full w-full object-cover object-center"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      </Link>

      <div className="mt-4 flex justify-between">
        <div>
          {/* Only the product name is clickable (navigates) */}
          <h3 className="text-sm text-gray-700 line-clamp-2">
            <Link href={`/product/${handle || id}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          {variants[0]?.selectedOptions?.some((opt: { name: string; value: string }) => opt.name === 'Color') && (
            <p className="mt-1 text-sm text-gray-500">
              {variants[0]?.selectedOptions?.find((opt: { name: string; value: string }) => opt.name === 'Color')?.value}
            </p>
          )}
        </div>

        <div className="text-right">
          {isOnSale && displayCompareAtPrice && (
            <p className="text-sm text-gray-500 line-through">
              {formatPrice(displayCompareAtPrice.amount, displayCompareAtPrice.currencyCode)}
            </p>
          )}
          <p className={`text-sm font-medium ${isOnSale ? 'text-red-600' : 'text-gray-900'}`}>
            {formatPrice(displayPrice.amount, displayPrice.currencyCode)}
          </p>
        </div>
      </div>

      {/* Sale badge */}
      {isOnSale && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
          SALE
        </div>
      )}
    </div>
  );
}

