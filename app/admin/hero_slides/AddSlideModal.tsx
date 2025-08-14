"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AddSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSlideModal({ isOpen, onClose }: AddSlideModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cta_text: "",
    cta_link: "",
    image_url: "",
    alt_text: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePostData = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/slides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // ✅ use the same form data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create test slide");
      }

      const newSlide = await response.json();
      console.log("Test slide created:", newSlide);
      onClose();
    } catch (err) {
      console.error("Test Error:", err);
      setError("Failed to create test slide. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTestSlide = async () => {
    if (!confirm("Are you sure?")) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/slides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "96bfb502-1d88-46d2-8793-c1e9409de457" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }

      console.log("Deleted", await res.json());
    } catch (err) {
      // setError(err.message);
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/slides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create slide");
      }

      const newSlide = await response.json();
      console.log("Slide created:", newSlide);
      onClose();
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred while creating the slide");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add New Hero Slide</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Test Actions</h4>
              <button
                type="button"
                onClick={handlePostData}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                {isSubmitting
                  ? "Creating Test Slide..."
                  : "Create Test Slide (ID: 2)"}
              </button>
              <button
                type="button"
                onClick={handleDeleteTestSlide}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                {isSubmitting ? "Deleting..." : "Delete Test Slide (ID: 2)"}
              </button>
            </div>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Text
              </label>
              <input
                type="text"
                name="cta_text"
                value={formData.cta_text}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CTA Link
              </label>
              <input
                type="url"
                name="cta_link"
                value={formData.cta_link}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                name="alt_text"
                value={formData.alt_text}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? "Creating..." : "Create Slide"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
