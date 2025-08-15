"use client";

import { useState, useEffect } from "react";
import AddCollectionModal from "./AddCollectionModal";

interface Collection {
  id: string;
  sort_order: number;
  handle: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/collections");
      if (!res.ok) throw new Error("Failed to fetch collections");
      const data: Collection[] = await res.json();
      setCollections(data);
    } catch (err) {
      console.error(err);
      setError("Could not load collections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    try {
      const res = await fetch("/api/collections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete collection");
      }

      await fetchCollections();
    } catch (err) {
      console.error(err);
      setError("Could not delete collection.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Collections Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Add New Collection
        </button>
      </div>

      {loading && <p>Loading collections...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && collections.length === 0 && <p>No collections found.</p>}

      <div className="flex flex-col gap-6">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="border rounded-lg p-4 flex justify-between items-center shadow hover:shadow-lg transition"
          >
            <div>
              <h2 className="text-lg font-bold">{collection.title}</h2>
              <p className="text-gray-600">Handle: {collection.handle}</p>
              {collection.description && (
                <p className="text-gray-500">{collection.description}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(collection.id)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <AddCollectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchCollections();
        }}
      />
    </div>
  );
}
