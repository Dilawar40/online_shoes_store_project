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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/slides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }

      console.log("Deleted", await res.json());

      // Refresh slides after delete
      await fetchSlides();
    } catch (err) {
      console.log(err);
      setError("Could not delete slide.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* Slides List - Row-wise */}
      <div className="flex flex-col gap-6">
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

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteSlide(slide.id)}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
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
