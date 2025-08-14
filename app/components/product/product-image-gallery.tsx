'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Lightbox } from '../ui/lightbox';

type ImageType = {
  url: string;
  altText?: string;
};

interface ProductImageGalleryProps {
  images: ImageType[];
}

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = () => setIsLightboxOpen(true);
  const closeLightbox = () => setIsLightboxOpen(false);

  const goToNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-500 rounded-md">
        <span className="text-sm">No images available</span>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Main Image */}
      <div className="relative w-full aspect-square overflow-hidden rounded-md bg-gray-50">
        <button
          onClick={openLightbox}
          className="absolute inset-0 w-full h-full z-10 focus:outline-none"
          aria-label="View fullscreen"
        >
          <span className="sr-only">View fullscreen</span>
        </button>
        
        <Image
          src={images[currentIndex].url}
          alt={images[currentIndex].altText || 'Product image'}
          fill
          className="object-cover object-center cursor-zoom-in"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Navigation Arrows - Simplified like screenshot */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-sm p-1 shadow-sm z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-sm p-1 shadow-sm z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      
      {/* Thumbnail Navigation - Simplified like screenshot */}
      {images.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              className={`relative w-10 h-10 rounded-sm overflow-hidden ${
                index === currentIndex ? 'ring-1 ring-gray-800' : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={image.altText || `Thumbnail ${index + 1}`}
                fill
                sizes="40px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Lightbox */}
      <Lightbox
        images={images}
        currentIndex={currentIndex}
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
        onNext={goToNextImage}
        onPrev={goToPrevImage}
      />
    </div>
  );
}