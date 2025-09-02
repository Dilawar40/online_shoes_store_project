"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Slide {
  id: string;
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  alt_text: string;
}

async function fetchHeroSlides() {
  try {
    const res = await fetch("/api/slides?limit=8");
    if (!res.ok) throw new Error("Failed to fetch slides");
    return await res.json();
  } catch (e) {
    console.error("Error fetching hero slides:", e);
    return [] as Slide[];
  }
}

export default function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSlides() {
      setIsLoading(true);
      const heroSlides = await fetchHeroSlides();
      setSlides(heroSlides);
      setIsLoading(false);
    }
    loadSlides();
  }, []);

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-rotate slides
  useEffect(() => {
    if (isPaused || slides.length === 0) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide, isPaused, slides.length]);

  if (isLoading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading slides...</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">No slides available</div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[500px] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full flex-shrink-0 relative">
            <div className="absolute inset-0 bg-black/30 z-10 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-3xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {slide.title}
                </h2>
                <p className="text-xl mb-6">{slide.description}</p>
                <Link
                  href={slide.cta_link}
                  className="inline-block bg-white text-gray-900 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
                >
                  {slide.cta_text}
                </Link>
              </div>
            </div>
            <Image
              src={slide.image_url}
              alt={slide.alt_text}
              width={1920}
              height={500}
              className="w-full h-[500px] object-cover"
              priority
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === currentSlide ? "bg-white w-6" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
