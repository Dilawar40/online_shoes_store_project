import Link from "next/link";
import { Suspense } from "react";
import LogoSquare from "../../logo-square";
import Search, { SearchSkeleton } from "./search";
import CartModal from "../../cart/modal";
import { staticCollections } from "@/app/lib/constants";

const { SITE_NAME } = process.env;

export async function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 text-gray-700 rounded-md dark:text-gray-300 hover:text-black dark:hover:text-white focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>

          {/* Logo and desktop navigation */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" prefetch={true} className="flex items-center">
              <LogoSquare />
              <span className="ml-2 text-sm font-medium uppercase md:text-base lg:block">
                {SITE_NAME}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:block md:ml-10">
              <ul className="flex space-x-4">
                {(() => {
              // console.log("staticCollections before sort:", staticCollections);
              const sorted = staticCollections.sort(
                (a, b) => a.sortOrder - b.sortOrder
              );
              // console.log("staticCollections after sort:", sorted);
              return sorted.map((collection) => {
                // console.log("Rendering collection:", collection);
                return (
                  <li key={collection.id}>
                    <Link
                      href="/search"
                      prefetch
                      className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                    >
                      {collection.title}
                    </Link>
                  </li>
                );
                });
              })()}
              </ul>
            </div>
          </div>

          {/* Search bar - visible on all screens */}
          <div className="flex-1 max-w-2xl px-4 mx-4">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>

          {/* Cart and mobile menu button */}
          <div className="flex items-center
          ">
            <div className="ml-4">
              <CartModal />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {staticCollections.map((collection) => (
            <Link
              key={collection.id}
              href="/search"
              className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {collection.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
