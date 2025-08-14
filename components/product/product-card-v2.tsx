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

export function ProductCardV2({ 
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
    
  // Define color variant type
  type ColorVariant = {
    id?: string;
    name: string;
    featuredImage?: { url: string };
  };
  
  // Get color variants if available
  const colorVariants: ColorVariant[] = (product.variants || [])
    .filter((v: any) => v?.name && typeof v.name === 'string' && v.name.toLowerCase().includes('color'))
    .map(v => ({
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
          <div className="relative" style={{
            width: '100%',
            aspectRatio: '1',
            overflow: 'hidden',
            backgroundColor: '#f8f8f8',
            position: 'relative',
            marginBottom: '12px'
          }}>
            {/* Main Image */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              opacity: 1,
              transition: 'opacity 0.3s ease'
            }} className="group-hover:opacity-0">
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
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                backgroundColor: '#f8f8f8'
              }} className="group-hover:opacity-100">
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
            
            {/* Badge - Sale */}
            {isOnSale && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: '#000',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '4px 8px',
                borderRadius: '2px',
                lineHeight: '1.2',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                zIndex: 2
              }}>
                {discountPercentage}% OFF
              </div>
            )}
            
            {/* Badge - New */}
            {product.tags?.includes('new') && (
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: '#000',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '4px 8px',
                borderRadius: '2px',
                lineHeight: '1.2',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                zIndex: 2
              }}>
                NEW
              </div>
            )}
            
            {/* Quick Add to Cart */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#000',
              color: '#fff',
              textAlign: 'center',
              padding: '10px',
              transform: 'translateY(100%)',
              transition: 'transform 0.3s ease',
              zIndex: 3
            }} className="group-hover:transform-none">
              <span style={{
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                ADD TO CART
              </span>
            </div>
          </div>
          
          {/* Color Swatches */}
          {colorVariants.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '8px',
              flexWrap: 'wrap'
            }}>
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
                  olive: '#808000',
                  army: '#4b5320',
                  khaki: '#c3b091',
                  camel: '#c19a6b',
                  cognac: '#9a463d',
                  burgundy: '#800020',
                  wine: '#722f37',
                  merlot: '#831923',
                  brick: '#cb4154',
                  coral: '#ff7f50',
                  terracotta: '#e2725b',
                  rust: '#b7410e',
                  orange: '#ffa500',
                  mustard: '#ffdb58',
                  gold: '#ffd700',
                  yellow: '#ffff00',
                  lemon: '#fff44f',
                  lime: '#c7ea46',
                  olive: '#808000',
                  sage: '#9dc183',
                  mint: '#98ff98',
                  jade: '#00a86b',
                  emerald: '#50c878',
                  teal: '#008080',
                  turquoise: '#40e0d0',
                  sky: '#87ceeb',
                  navy: '#000080',
                  royal: '#4169e1',
                  cobalt: '#0047ab',
                  denim: '#1560bd',
                  blue: '#0000ff',
                  periwinkle: '#ccccff',
                  lavender: '#e6e6fa',
                  lilac: '#c8a2c8',
                  purple: '#800080',
                  plum: '#dda0dd',
                  violet: '#8f00ff',
                  magenta: '#ff00ff',
                  fuchsia: '#ff77ff',
                  pink: '#ffc0cb',
                  rose: '#ff007f',
                  blush: '#de5d83',
                  red: '#ff0000',
                  cherry: '#d2042d',
                  wine: '#722f37',
                  maroon: '#800000',
                  brown: '#a52a2a',
                  tan: '#d2b48c',
                  beige: '#f5f5dc',
                  cream: '#fffdd0',
                  ivory: '#fffff0',
                  white: '#ffffff',
                  silver: '#c0c0c0',
                  gray: '#808080',
                  charcoal: '#36454f',
                  black: '#000000',
                  // Add more colors as needed
                };
                
                // Check if variant name matches any color in our map
                const matchedColor = Object.entries(colorMap).find(([key]) => 
                  colorName.includes(key)
                );
                        bottom: 0,
                        backgroundImage: `url(${variant.featuredImage.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Product Title */}
          <h3 style={{
            fontSize: '14px',
            fontWeight: 400,
            margin: '0 0 4px',
            lineHeight: '1.4',
            color: '#000',
            textTransform: 'none',
            letterSpacing: '0.3px',
            minHeight: '40px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {product.title}
          </h3>
          
          {/* Price */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            marginTop: '4px'
          }}>
            {isOnSale ? (
              <>
                <span style={{
                  fontSize: '14px',
                  color: '#000',
                  fontWeight: 500,
                  textDecoration: 'line-through',
                  opacity: 0.6
                }}>
                  {formattedCompareAtPrice}
                </span>
                <span style={{
                  fontSize: '16px',
                  color: '#000',
                  fontWeight: 600
                }}>
                  {formattedPrice}
                </span>
              </>
            ) : (
              <span style={{
                fontSize: '16px',
                color: '#000',
                fontWeight: 600
              }}
            >
              {formattedPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
