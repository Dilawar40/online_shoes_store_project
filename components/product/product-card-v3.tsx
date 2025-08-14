'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product as ProductType } from '@/types/product.types';
import clsx from 'clsx';

type ProductCardProps = {
  product: ProductType;
  className?: string;
  priority?: boolean;
};

// Helper function to format price
const formatPrice = (price: number | string | { amount: string | number; currencyCode: string } | undefined): string => {
  if (!price) return 'Rs.0';
  
  let amount = 0;
  if (typeof price === 'number') {
    amount = price;
  } else if (typeof price === 'string') {
    amount = parseFloat(price);
  } else if (price && typeof price === 'object' && 'amount' in price) {
    amount = typeof price.amount === 'string' ? parseFloat(price.amount) : price.amount;
  }
  
  // Format number with commas as thousand separators
  return `Rs.${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Define color variant type
type ColorVariant = {
  id?: string;
  name: string;
  featuredImage?: { url: string; altText?: string };
};

export function ProductCardV3({ 
  product, 
  className = '',
  priority = false 
}: ProductCardProps) {
  // Get the primary image and additional images
  const primaryImage = product.featuredImage || 
    (product.images && product.images[0]) || 
    { url: '/placeholder-product.jpg', altText: product.title };
  
  // Get all images for the product
  const allImages = [primaryImage, ...(product.images?.filter(img => img.url !== primaryImage.url) || [])];
  
  // Format prices
  const price = typeof product.price === 'number' 
    ? product.price 
    : product.price?.amount || 0;
  
  const formattedPrice = formatPrice(price);
  
  // Check if product is on sale
  const compareAtPrice = (() => {
    if (typeof product.compareAtPrice === 'number') return product.compareAtPrice;
    if (typeof product.compareAtPrice === 'object' && product.compareAtPrice?.amount) {
      return parseFloat(product.compareAtPrice.amount.toString());
    }
    return 0;
  })();
  
  const formattedCompareAtPrice = formatPrice(compareAtPrice);
  const currentPrice = parseFloat(price.toString());
  const isOnSale = compareAtPrice > currentPrice;
  const discountPercentage = isOnSale && compareAtPrice > 0 
    ? Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100) 
    : 0;
    
  // Get color variants if available
  const colorVariants: ColorVariant[] = (product.variants || [])
    .filter((v: any) => v?.name && typeof v.name === 'string' && v.name.toLowerCase().includes('color'))
    .map((v: any) => ({
      id: v.id,
      name: v.name || 'Color',
      featuredImage: v.featuredImage
    }));

  return (
    <div 
      className={clsx('group', className)} 
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        fontFamily: 'HelveticaNeueCyr, Helvetica, "Helvetica Neue", Arial, "Lucida Grande", sans-serif',
        fontSize: '16px',
        lineHeight: '1.5',
        color: '#000',
        textAlign: 'left',
        margin: '0',
        padding: '0',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div 
        className="relative" 
        style={{
          width: '100%',
          flex: '1 0 auto'
        }}
      >
        <Link
          href={`/product/${product.handle || '#'}`}
          prefetch={!!product.handle}
          className="block w-full h-full"
          style={{
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
            height: '100%',
            position: 'relative'
          }}
        >
          {/* Image Container */}
          <div 
            className="relative" 
            style={{
              width: '100%',
              aspectRatio: '1',
              overflow: 'hidden',
              backgroundColor: '#f8f8f8',
              position: 'relative',
              marginBottom: '12px'
            }}
          >
            {/* Main Image */}
            <div 
              className="group-hover:opacity-0 transition-opacity duration-300"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                opacity: 1
              }}
            >
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText || product.title || 'Product image'}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                style={{
                  objectFit: 'contain',
                  objectPosition: 'center',
                  width: '100%',
                  height: '100%',
                }}
                priority={priority}
              />
            </div>
            
            {/* Hover Image */}
            {allImages[1] && (
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  backgroundColor: '#f8f8f8'
                }}
              >
                <Image
                  src={allImages[1].url}
                  alt={allImages[1].altText || `${product.title} - Hover`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                />
              </div>
            )}
            
            {/* Badge - 20% Discount */}
            <div 
              className="absolute top-3 right-3 bg-black text-white text-xs font-bold px-2 py-1 rounded-sm uppercase z-10"
              style={{
                letterSpacing: '0.5px',
                lineHeight: '1.2'
              }}
            >
              20%
            </div>
            
            {/* Badge - New */}
            {product.tags?.includes('new') && (
              <div 
                className="absolute top-3 left-3 text-white text-xs font-bold px-2 py-1 rounded-sm uppercase z-10"
                style={{
                  letterSpacing: '0.5px',
                  lineHeight: '1.2'
                }}
              >
                NEW
              </div>
            )}
            

          </div>
          
          {/* Color Swatches */}
          {colorVariants.length > 0 && (
            <div className="flex gap-1.5 mb-2 flex-wrap">
              {colorVariants.map((variant, index) => {
                // Try to extract color from variant name or use a default
                const colorName = variant.name.toLowerCase();
                let bgColor = '#f0f0f0';
                
                // Map common color names to hex values
                const colorMap: Record<string, string> = {
                  black: '#000000',
                  white: '#ffffff',
                  red: '#ff0000',
                  blue: '#0000ff',
                  green: '#008000',
                  yellow: '#ffff00',
                  pink: '#ffc0cb',
                  purple: '#800080',
                  orange: '#ffa500',
                  brown: '#a52a2a',
                  grey: '#808080',
                  gray: '#808080',
                  navy: '#000080',
                  beige: '#f5f5dc',
                  khaki: '#f0e68c',
                  olive: '#808000',
                  teal: '#008080',
                  maroon: '#800000',
                  gold: '#ffd700',
                  silver: '#c0c0c0',
                  bronze: '#cd7f32',
                  cream: '#fffdd0',
                  camel: '#c19a6b',
                  tan: '#d2b48c',
                  burgundy: '#800020',
                  rose: '#ff007f',
                  lavender: '#e6e6fa',
                  mint: '#98ff98',
                  coral: '#ff7f50',
                  mustard: '#ffdb58',
                  wine: '#722f37',
                  peach: '#ffe5b4',
                  rust: '#b7410e',
                  plum: '#dda0dd',
                  turquoise: '#40e0d0',
                  mauve: '#e0b0ff',
                  forest: '#228b22',
                  sky: '#87ceeb',
                  charcoal: '#36454f',
                  stone: '#928e85',
                  taupe: '#483c32',
                  espresso: '#4b3621',
                  coffee: '#6f4e37',
                  cocoa: '#d2691e',
                  sand: '#f4a460',
                  nude: '#f3e5ab',
                  blush: '#de5d83',
                  lilac: '#c8a2c8',
                  jade: '#00a86b',
                  emerald: '#50c878',
                  sage: '#9dc183',
                  army: '#4b5320',
                  cognac: '#9a463d',
                  merlot: '#831923',
                  brick: '#cb4154',
                  terracotta: '#e2725b',
                  lemon: '#fff44f',
                  lime: '#c7ea46',
                  royal: '#4169e1',
                  cobalt: '#0047ab',
                  denim: '#1560bd',
                  periwinkle: '#ccccff',
                  violet: '#8f00ff',
                  magenta: '#ff00ff',
                  fuchsia: '#ff77ff',
                  cherry: '#d2042d',
                  ivory: '#fffff0'
                };
                
                // Check if variant name matches any color in our map
                const matchedColor = Object.entries(colorMap).find(([key]) => 
                  colorName.includes(key)
                );
                
                if (matchedColor) {
                  bgColor = matchedColor[1];
                }
                
                return (
                  <div 
                    key={variant.id || `color-${index}`}
                    className="w-4 h-4 rounded-full border border-gray-200 cursor-pointer relative overflow-hidden"
                    style={{
                      backgroundColor: bgColor
                    }}
                    title={variant.name}
                  >
                    {variant.featuredImage?.url && (
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${variant.featuredImage.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Product Title */}
          <h3 
            className="text-sm font-normal mb-1 text-black leading-snug tracking-wide line-clamp-2"
            style={{
              minHeight: '40px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {product.title}
          </h3>
          
          {/* Price with Discount */}
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm text-gray-500 font-medium line-through">
              {formattedCompareAtPrice}
            </span>
            <span className="text-base text-black font-bold">
              {formattedPrice}
            </span>
            <span className="text-xs text-red-600 font-medium">
              (20% OFF)
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default ProductCardV3;
