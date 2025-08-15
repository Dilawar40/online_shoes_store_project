"use client";

import { useState } from "react";

interface AddCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCollectionModal({ isOpen, onClose }: AddCollectionModalProps) {
  const [formData, setFormData] = useState({
    sort_order: 1,
    handle: "",
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create collection");
      }

      await res.json();
      onClose();
    } catch (err) {
      console.error(err);
      setError("An error occurred while creating the collection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Add New Collection</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        {error && <div className="bg-red-100 text-red-700 px-4 py-2 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {[
            { label: "Sort Order", name: "sort_order", type: "number", required: true },
            { label: "Handle", name: "handle", type: "text", required: true },
            { label: "Title", name: "title", type: "text", required: true },
            { label: "Description", name: "description", type: "textarea" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? "Creating..." : "Create Collection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
