'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/app/lib/constants';

export default function ProductCard({ product }: { product: Product }) {
  // Get the price from the product's price range
  const price = product.priceRange?.maxVariantPrice?.amount || 0;
  
  // For static data, we'll use a simple discount calculation
  // In a real app, this would come from the product data
  const hasDiscount = Math.random() > 0.7; // 30% chance of having a discount
  const discount = hasDiscount ? Math.floor(Math.random() * 40) + 10 : 0; // 10-50% off
  const compareAtPrice = hasDiscount ? price * (1 + discount / 100) : 0;

  return (
    <div className="group relative">
      <div className="aspect-square w-full overflow-hidden bg-white">
        <Link href={`/product/${product.handle}`} className="block h-full w-full">
          <div className="relative h-full w-full p-1">
            <Image
              src={product.featuredImage?.url || '/placeholder.jpg'}
              alt={product.title}
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
