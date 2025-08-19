"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setIsLoggedIn(true);
        if (!session) {
          // Redirect to login page if not authenticated
          router.push("/admin/login");
          return;
        }
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error checking auth:", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="mb-8">
        <a
          href="/admin/test-upload"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go to Test Upload
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          className="bg-white p-6 rounded-lg shadow cursor-pointer"
          onClick={() => router.push("/admin/seed-products/")}
        >
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          <p className="text-gray-600">Manage your products</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Orders</h2>
          <p className="text-gray-600">View and manage orders</p>
        </div>
        <div
          className="bg-white p-6 rounded-lg shadow cursor-pointer"
          onClick={() => router.push("/admin/collections")}
        >
          <h2 className="text-xl font-semibold mb-2">Collections</h2>
          <p className="text-gray-600">Manage product categories</p>
        </div>
        <div
          className="bg-white p-6 rounded-lg shadow cursor-pointer"
          onClick={() => router.push("/admin/hero_slides")}
        >
          <h2 className="text-xl font-semibold mb-2">Hero Slides</h2>
          <p className="text-gray-600">Manage hero slides</p>
        </div>
      </div>
    </div>
  );
}
