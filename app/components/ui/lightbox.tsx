'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

type LightboxProps = {
  images: { url: string; altText?: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-6xl max-h-[90vh] flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={images[currentIndex].url}
            alt={images[currentIndex].altText || 'Product image'}
            width={1200}
            height={1200}
            className="max-w-full max-h-[80vh] object-contain"
            priority
          />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
          aria-label="Next image"
        >
          <ChevronRight className="h-8 w-8" />
        </button>

        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
          aria-label="Close lightbox"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
