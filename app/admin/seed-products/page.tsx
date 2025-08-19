"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPackage,
} from "react-icons/fi";

type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
  price_amount: number;
  price_currency: string;
  min_price_amount: number;
  max_price_amount: number;
  featured_image: {
    url: string;
    altText?: string;
  } | null;
  images: Array<{
    url: string;
    altText?: string;
  }>;
  options: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
  variants: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    options: Record<string, string>;
  }>;
  collections: string[];
  inventory_status: "in_stock" | "out_of_stock" | "low_stock";
  inventory_quantity: number;
  status: "active" | "draft" | "archived";
  created_at: string;
  updated_at: string;
};

const statusStyles = {
  active: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-800",
};

const inventoryStatusStyles = {
  in_stock: "text-green-700",
  out_of_stock: "text-red-700",
  low_stock: "text-yellow-700",
};

export default function ProductsHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const handleDeleteProduct = async (productId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsDeleting((prev) => ({ ...prev, [productId]: true }));

      const response = await fetch(`/api/products`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      // Remove the deleted product from the list
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productId)
      );

      // Close the expanded row if it was open
      setExpandedRows((prev) => {
        const newExpanded = { ...prev };
        delete newExpanded[productId];
        return newExpanded;
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    } finally {
      setIsDeleting((prev) => ({ ...prev, [productId]: false }));
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      (product.title?.toLowerCase() || "").includes(searchLower) ||
      (product.handle?.toLowerCase() || "").includes(searchLower) ||
      (product.description?.toLowerCase() || "").includes(searchLower) ||
      product.collections?.some((collection) =>
        collection.toLowerCase().includes(searchLower)
      ) ||
      product.variants?.some(
        (variant) =>
          variant.name.toLowerCase().includes(searchLower) ||
          Object.values(variant.options || {}).some((opt) =>
            opt.toLowerCase().includes(searchLower)
          )
      )
    );
  });

  const toggleRow = (productId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const getStatusIcon = (status: "active" | "draft" | "archived") => {
    switch (status) {
      case "active":
        return <FiCheckCircle className="mr-1.5 h-4 w-4 flex-shrink-0" />;
      case "draft":
        return <FiClock className="mr-1.5 h-4 w-4 flex-shrink-0" />;
      case "archived":
        return <FiXCircle className="mr-1.5 h-4 w-4 flex-shrink-0" />;
      default:
        return null;
    }
  };

  const getInventoryIcon = (
    status: "in_stock" | "out_of_stock" | "low_stock"
  ) => {
    switch (status) {
      case "in_stock":
        return <FiCheckCircle className="mr-1.5 h-4 w-4 flex-shrink-0" />;
      case "out_of_stock":
        return <FiXCircle className="mr-1.5 h-4 w-4 flex-shrink-0" />;
      case "low_stock":
        return <FiAlertCircle className="mr-1.5 h-4 w-4 flex-shrink-0" />;
      default:
        return <FiPackage className="mr-1.5 h-4 w-4 flex-shrink-0" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiXCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading products
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-md bg-red-50 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all products in your store including their details.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/seed-products/createproduct"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Inventory
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <>
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {product.featured_image?.url ? (
                                <img
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={product.featured_image.url}
                                  alt={
                                    product.featured_image.altText ||
                                    product.title
                                  }
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                  <FiPackage className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.handle}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              statusStyles[product.status]
                            }`}
                          >
                            {product.status.charAt(0).toUpperCase() +
                              product.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`flex items-center ${
                              inventoryStatusStyles[product.inventory_status]
                            }`}
                          >
                            {getInventoryIcon(product.inventory_status)}
                            <span className="ml-1">
                              {product.inventory_status
                                .split("_")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")}
                              {product.inventory_status !== "out_of_stock" &&
                                ` (${product.inventory_quantity})`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: product.price_currency || "USD",
                          }).format(product.min_price_amount)}
                          {product.min_price_amount !==
                            product.max_price_amount && (
                            <span>
                              {" "}
                              -{" "}
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: product.price_currency || "USD",
                              }).format(product.max_price_amount)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => toggleRow(product.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {expandedRows[product.id] ? (
                                <FiChevronUp className="h-5 w-5" />
                              ) : (
                                <FiChevronDown className="h-5 w-5" />
                              )}
                            </button>
                            <Link
                              href={`/admin/seed-products/edit/${product.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FiEdit2 className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(product.id);
                              }}
                              disabled={isDeleting[product.id]}
                              className={`text-red-600 hover:text-red-900 ${
                                isDeleting[product.id]
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              title="Delete product"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows[product.id] && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Description */}
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                  Description
                                </h3>
                                <p className="mt-1 text-sm text-gray-900">
                                  {product.description ||
                                    "No description available"}
                                </p>
                              </div>

                              {/* Collections */}
                              <div>
                                <h3 className="text-sm font-medium text-gray-500">
                                  Collections
                                </h3>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {product.collections?.length ? (
                                    product.collections.map((c) => (
                                      <span
                                        key={c}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                      >
                                        {c}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      No collections
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Variants */}
                              <div className="md:col-span-2">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">
                                  Variants
                                </h3>
                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                  <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                          Name
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                          Options
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                          Price
                                        </th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                          Stock
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                      {product.variants?.length ? (
                                        product.variants.map((variant) => (
                                          <tr key={variant.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                              {variant.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              {Array.isArray(variant.options) &&
                                                variant.options.map(
                                                  (opt, idx) => (
                                                    <div key={idx}>
                                                      <span className="font-medium">
                                                        {opt.name}:
                                                      </span>{" "}
                                                      {opt.value}
                                                    </div>
                                                  )
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              {new Intl.NumberFormat("en-US", {
                                                style: "currency",
                                                currency:
                                                  product.price_currency ||
                                                  "USD",
                                              }).format(variant.price)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                              {variant.stock}
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td
                                            colSpan={4}
                                            className="px-3 py-4 text-center text-sm text-gray-500"
                                          >
                                            No variants available
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Images */}
                              <div className="md:col-span-2">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">
                                  Images
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {product.images?.length ? (
                                    product.images.map((img, idx) => (
                                      <div
                                        key={idx}
                                        className="h-20 w-20 rounded-md overflow-hidden border"
                                      >
                                        <img
                                          src={img.url}
                                          alt={img.altText}
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-gray-500">
                                      No images available
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="md:col-span-2 flex justify-between items-center pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                  <p>
                                    Created:{" "}
                                    {format(
                                      new Date(product.created_at),
                                      "MMM d, yyyy h:mm a"
                                    )}
                                  </p>
                                  <p>
                                    Updated:{" "}
                                    {format(
                                      new Date(product.updated_at),
                                      "MMM d, yyyy h:mm a"
                                    )}
                                  </p>
                                </div>
                                <div className="flex space-x-3">
                                  <Link
                                    href={`/admin/seed-products/edit/${product.id}`}
                                    className="inline-flex items-center rounded-md bg-blue-600 text-white px-3 py-2 text-sm"
                                  >
                                    <FiEdit2 className="-ml-1 mr-2 h-4 w-4" />
                                    Edit Product
                                  </Link>
                                  <Link
                                    href={`/products/${product.handle}`}
                                    target="_blank"
                                    className="inline-flex items-center rounded-md border px-3 py-2 text-sm"
                                  >
                                    <FiEye className="-ml-1 mr-2 h-4 w-4" />
                                    View in Store
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No products found
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchQuery
                          ? "No products match your search criteria."
                          : "Get started by creating a new product."}
                      </p>
                      <div className="mt-6">
                        <Link
                          href="/admin/seed-products/createproduct"
                          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                          New Product
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
