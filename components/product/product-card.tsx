import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product.types';
import { formatPrice } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const { id, title, handle, price, compareAtPrice, featuredImage, variants = [] } = product;
  
  // Get the first variant's price if available
  const displayPrice = price || variants[0]?.price || { amount: '0', currencyCode: 'PKR' };
  const displayCompareAtPrice = compareAtPrice || variants[0]?.compareAtPrice;
  
  // Check if product is on sale
  const isOnSale = displayCompareAtPrice && 
    Number(displayCompareAtPrice.amount) > Number(displayPrice.amount);
  
  // Get the first available variant's image or use the product's featured image
  const imageUrl = variants[0]?.image?.url || featuredImage?.url || '/placeholder-product.jpg';
  const altText = variants[0]?.image?.altText || featuredImage?.altText || title;
  
  return (
    <div className="group relative">
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
        
        <div className="mt-4 flex justify-between">
          <div>
            <h3 className="text-sm text-gray-700 line-clamp-2">
              <span aria-hidden="true" className="absolute inset-0" />
              {title}
            </h3>
            {variants[0]?.selectedOptions?.some(opt => opt.name === 'Color') && (
              <p className="mt-1 text-sm text-gray-500">
                {variants[0]?.selectedOptions?.find(opt => opt.name === 'Color')?.value}
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
        
        {/* New badge (example: if product is new) */}
        {product.status === 'new' && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
            NEW
          </div>
        )}
      </Link>
    </div>
  );
}
