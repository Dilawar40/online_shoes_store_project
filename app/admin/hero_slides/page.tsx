"use client";

import { useState, useEffect } from "react";
import AddSlideModal from "./AddSlideModal";

interface Slide {
  id: string;
  title: string;
  description: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  alt_text?: string;
  created_at: string;
}

export default function HeroSlidesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch slides from API
  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/slides");
      if (!res.ok) {
        throw new Error("Failed to fetch slides");
      }
      const data: Slide[] = await res.json();
      setSlides(data);
    } catch (err) {
      console.error(err);
      setError("Could not load slides.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Hero Slides Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Add New Slide
        </button>
      </div>

      {loading && <p>Loading slides...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && slides.length === 0 && <p>No slides found.</p>}

      {/* Slides List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
          >
            {slide.image_url && (
              <img
                src={slide.image_url}
                alt={slide.alt_text || slide.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-lg font-bold">{slide.title}</h2>
              <p className="text-gray-600">{slide.description}</p>
              {slide.cta_link && (
                <a
                  href={slide.cta_link}
                  className="mt-2 inline-block text-blue-600 hover:underline"
                >
                  {slide.cta_text || "Learn More"}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <AddSlideModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchSlides(); // refresh after closing modal
        }}
      />
    </div>
  );
}
