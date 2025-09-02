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
    <div className="relative w-full ">
      <div className="flex gap-2 ">
        {/* Vertical Thumbnails */}
        {images.length > 1 && (
          <div className="hidden sm:flex sm:flex-col gap-2 w-12 overflow-auto max-h-[560px] pr-1">
            {images.map((image, index) => (
              <button
                key={index}
                type="button"
                className={`relative w-12 h-12 rounded-sm overflow-hidden border ${
                  index === currentIndex
                    ? 'ring-2 ring-gray-900 border-transparent'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image.url}
                  alt={image.altText || `Thumbnail ${index + 1}`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image */}
        <div className="relative w-full flex-1 aspect-square max-h-[480px] md:max-h-[520px] overflow-hidden rounded-md bg-gray-50">
          <button
            onClick={openLightbox}
            className="absolute inset-0 w-full h-full z-10 focus:outline-none"
            aria-label="View fullscreen"
          >
            <span className="sr-only">View fullscreen</span>
          </button>

          {/* Full-bleed image with no side gaps */}
          <Image
            src={images[currentIndex].url}
            alt={images[currentIndex].altText || 'Product image'}
            fill
            className="object-cover object-center cursor-zoom-in"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* Navigation Arrows removed per request */}
        </div>
      </div>

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