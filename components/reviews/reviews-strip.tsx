"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";

type Review = {
  id: string;
  rating: number; // 1-5
  title?: string;
  text?: string;
  image: { url: string; alt?: string };
  author: string;
  date: string; // e.g., 07/30/2024
};

const STARS = new Array(5).fill(0);

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${rating} out of 5 stars`}>
      {STARS.map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-current" : "fill-amber-200"}`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.176 0L6.707 16.9c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.072 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l.977-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const DUMMY_REVIEWS: Review[] = [
  {
    id: "r1",
    rating: 5,
    title: "Beautiful yet comfortable",
    text: "Soft leather and comfy fit. Perfect for daily wear!",
    image: { url: "/images/Stylo1.jpg", alt: "customer photo 1" },
    author: "Alveena Ahmad",
    date: "07/30/2024",
  },
  {
    id: "r2",
    rating: 5,
    title: "Loved them",
    text: "Quality 10/10, super comfortable ✌️",
    image: { url: "/images/Stylo3.jpg", alt: "customer photo 2" },
    author: "K.P",
    date: "10/19/2024",
  },
  {
    id: "r3",
    rating: 5,
    title: "Lovely",
    text: "These are amazing! The color is gorgeous 💙",
    image: { url: "/images/hero/hero-1.jpg", alt: "customer photo 3" },
    author: "Ms Khan",
    date: "09/27/2024",
  },
  {
    id: "r4",
    rating: 5,
    title: "Quality 10/10",
    text: "Sturdy build and stylish design, totally worth it.",
    image: { url: "/images/hero/hero-2.jpg", alt: "customer photo 4" },
    author: "Ahmed",
    date: "08/22/2024",
  },
  {
    id: "r5",
    rating: 5,
    title: "So comfortable",
    text: "Lightweight and fits true to size.",
    image: { url: "/images/hero/hero-3.jpg", alt: "customer photo 5" },
    author: "Fatima",
    date: "06/14/2024",
  },
];

export default function ReviewsStrip({
  reviews = DUMMY_REVIEWS,
  totalLabel = "from 747 reviews",
  className = "",
}: {
  reviews?: Review[];
  totalLabel?: string;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const isHoveringRef = useRef<boolean>(false);

  const scrollByAmount = (dir: "left" | "right") => () => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(600, el.clientWidth * 0.9);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  // Autoplay horizontal loop
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      if (isHoveringRef.current) return; // pause on hover
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const step = Math.min(400, Math.max(220, el.clientWidth * 0.6));
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={`mx-auto max-w-screen-2xl px-6 sm:px-10 py-10 ${className}`}>
      <div className="text-center">
        <h2 className="text-lg font-semibold tracking-wide">LET CUSTOMERS SPEAK FOR US</h2>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm">
          <Stars rating={5} />
          <span className="text-gray-600">{totalLabel}</span>
        </div>
      </div>

      <div className="relative mt-8">
        {/* Left/Right controls */}
        <button
          aria-label="Scroll left"
          onClick={scrollByAmount("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-8 w-8 items-center justify-center rounded-full border bg-white text-gray-700 shadow hover:bg-gray-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/></svg>
        </button>
        <button
          aria-label="Scroll right"
          onClick={scrollByAmount("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-8 w-8 items-center justify-center rounded-full border bg-white text-gray-700 shadow hover:bg-gray-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0L13.707 9.293a1 1 0 010 1.414L8.707 15.707a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
        </button>

        <div
          ref={scrollerRef}
          className="flex gap-6 overflow-x-auto pb-2 px-8 sm:px-16 [scrollbar-width:none] [-ms-overflow-style:none]"
          onMouseEnter={() => (isHoveringRef.current = true)}
          onMouseLeave={() => (isHoveringRef.current = false)}
        >
          {/* hide scrollbar webkit */}
          <style jsx>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>
          {reviews.map((r) => (
            <article key={r.id} className="min-w-[180px] max-w-[200px] shrink-0">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-gray-100 p-1">
                <Image
                  src={r.image.url}
                  alt={r.image.alt || "review image"}
                  width={200}
                  height={260}
                  className="h-full w-full object-cover"
                  sizes="(max-width: 640px) 60vw, (max-width: 1024px) 30vw, 200px"
                />
              </div>
              <div className="mt-2">
                <Stars rating={r.rating} />
              </div>
              {(r.text || r.title) && (
                <p className="mt-1 text-sm text-gray-800 line-clamp-3">{r.text || r.title}</p>
              )}
              <p className="mt-2 text-xs font-medium text-gray-900">{r.author}</p>
              <p className="text-[11px] text-gray-500">{r.date}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
