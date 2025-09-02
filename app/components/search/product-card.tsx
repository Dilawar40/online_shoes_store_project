'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/app/lib/constants';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  // Get the price from the product's price range
  const price = product.priceRange?.maxVariantPrice?.amount || 0;
  
  // For static data, we'll use a simple discount calculation
  // In a real app, this would come from the product data
  const hasDiscount = Math.random() > 0.7; // 30% chance of having a discount
  const discount = hasDiscount ? Math.floor(Math.random() * 40) + 10 : 0; // 10-50% off
  const compareAtPrice = hasDiscount ? price * (1 + discount / 100) : 0;

  // Build gallery from product images with fallback to featured image
  const gallery = useMemo(() => {
    const imgs: Array<{ url: string; altText?: string }> = [];
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img?.url) imgs.push({ url: img.url, altText: img.altText });
      }
    }
    if (imgs.length === 0 && product.featuredImage?.url) {
      imgs.push({ url: product.featuredImage.url, altText: product.featuredImage.altText });
    }
    if (imgs.length === 0) {
      imgs.push({ url: '/placeholder.jpg', altText: product.title });
    }
    return imgs;
  }, [product.images, product.featuredImage, product.title]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setCurrentIdx(0);
  }, [gallery.length]);

  // Mobile-only auto-rotate when at least 50% visible
  useEffect(() => {
    if (!containerRef.current) return;
    if (gallery.length <= 1) return;

    const mql = window.matchMedia('(max-width: 640px)');

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

    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(handleVisibility, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });
    if (containerRef.current) observerRef.current.observe(containerRef.current);

    const handleMqlChange = () => {
      if (!mql.matches) {
        clearTicker();
      }
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

  const imageUrl = gallery[currentIdx]?.url || '/placeholder.jpg';
  const altText = gallery[currentIdx]?.altText || product.title;

  return (
    <div className="group relative" ref={containerRef}>
      <div className="aspect-square w-full overflow-hidden bg-white">
        <Link href={`/product/${product.handle}`} className="block h-full w-full">
          <div className="relative h-full w-full p-1">
            <Image
              src={imageUrl}
              alt={altText}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain group-hover:opacity-90 transition-opacity duration-200"
              priority={false}
            />
            {discount > 0 && (
              <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1">
                {discount}% OFF
              </span>
            )}
          </div>
        </Link>
      </div>
      <div className="mt-2">
        <h3 className="text-sm text-gray-700 font-medium mb-1 line-clamp-2 h-10">
          <Link href={`/product/${product.handle}`} className="hover:text-gray-800">
            {product.title}
          </Link>
        </h3>
        <div className="flex items-center">
          <p className="text-base font-semibold text-gray-900">
            Rs. {price.toFixed(2)}
          </p>
          {compareAtPrice && compareAtPrice > price && (
            <p className="ml-2 text-sm text-gray-500 line-through">
              Rs. {compareAtPrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
