"use client";

import Link from "next/link";
import { useState } from "react";

type Collection = { id: string; handle: string; title: string };

export default function MobileMenu({ collections }: { collections: Collection[] }) {
  const [open, setOpen] = useState(false);

  const linkFor = (c: Collection) => (c.handle === "all" ? "/search" : `/search/${c.handle}`);

  return (
    <div className="relative md:hidden">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-controls="mobile-menu-panel"
        aria-expanded={open}
        className="inline-flex items-center justify-center p-2 text-gray-700 rounded-md dark:text-gray-300 hover:text-black dark:hover:text-white focus:outline-none"
      >
        <span className="sr-only">Toggle main menu</span>
        {/* Hamburger / Close icon */}
        {open ? (
          <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m0 6H4" />
          </svg>
        )}
      </button>

      {/* Dropdown panel positioned below button */}
      <div
        id="mobile-menu-panel"
        className={`absolute left-0 top-full z-40 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg transition-all duration-200 ease-out dark:border-gray-800 dark:bg-black ${
          open ? "opacity-100 translate-y-0" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="py-2 space-y-1">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={linkFor(c)}
              className="block px-4 py-3 text-base font-medium text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 whitespace-nowrap truncate max-w-full"
              onClick={() => setOpen(false)}
            >
              {c.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
