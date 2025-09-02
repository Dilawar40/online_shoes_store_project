import Link from "next/link";
import { Suspense } from "react";
import LogoSquare from "../../logo-square";
import Search, { SearchSkeleton } from "./search";
import CartModal from "../../cart/modal";
import { staticCollections } from "@/app/lib/constants";
import { FaInstagram, FaFacebookF, FaYoutube, FaPinterestP, FaWhatsapp } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import MobileMenu from "./mobile-menu";

const { SITE_NAME } = process.env;

export async function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      {/* Top social media bar */}
      <div className="w-full bg-black text-white">
        <div className="relative mx-auto max-w-7xl h-8 px-4 sm:px-6 lg:px-8 flex items-center">
          {/* Centered marquee */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="overflow-hidden w-full max-w-xl">
              <div className="marquee whitespace-nowrap text-[11px] md:text-xs tracking-wide uppercase">
                <span className="mx-8">Free shipping in Pakistan</span>
                <span className="mx-8">Spend more than 5000</span>
                <span className="mx-8">New Collection</span>
                <span className="mx-8">Free shipping in Pakistan</span>
                <span className="mx-8">Spend more than 5000</span>
                <span className="mx-8">New Collection</span>
              </div>
            </div>
          </div>

          {/* Right aligned social icons */}
          <div className="ml-auto flex items-center gap-6 text-xs">
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="opacity-80 hover:opacity-100 p-1">
              <FaInstagram className="h-4 w-4" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="opacity-80 hover:opacity-100 p-1">
              <FaFacebookF className="h-4 w-4" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="opacity-80 hover:opacity-100 p-1">
              <FaYoutube className="h-4 w-4" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="opacity-80 hover:opacity-100 p-1">
              <FaTiktok className="h-4 w-4" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="opacity-80 hover:opacity-100 p-1">
              <FaPinterestP className="h-4 w-4" />
            </a>
            <a href="https://wa.me/923156822958" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="opacity-80 hover:opacity-100 p-1">
              <FaWhatsapp className="h-4 w-4" />
            </a>
          </div>
        </div>
        {/* Marquee animation styles */}
        <style>{`
          .marquee {
            display: inline-block;
            will-change: transform;
            animation: marquee-left 14s linear infinite;
          }
          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
      <div className="px-4 py-2 mx-auto max-w-7xl sm:px-6 lg:px-8 bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800">
        {/* Row 1: Logo | Search | Actions */}
        <div className="grid grid-cols-3 items-center gap-6 py-1">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-3">
            <div className="md:hidden"><MobileMenu collections={staticCollections} /></div>
            <Link href="/" prefetch={true} className="flex items-center">
              <LogoSquare />
              <span className="ml-2 text-base font-semibold uppercase tracking-wide hidden sm:inline-block">
                {SITE_NAME}
              </span>
            </Link>
          </div>

          {/* Center: Search only */}
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
              <Suspense fallback={<SearchSkeleton />}>
                <Search />
              </Suspense>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-2">
            {/* WhatsApp contact with hover tooltip */}
            <div className="relative group">
              <a
                href="https://wa.me/923156822958"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-neutral-200 text-black transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-900"
                aria-label="Chat on WhatsApp"
                title="Chat on WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4"
                  aria-hidden="true"
                >
                  <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.53 0 .24 5.29.24 11.82c0 2.08.55 4.11 1.59 5.9L0 24l6.44-1.75a11.8 11.8 0 0 0 5.62 1.43h.01c6.53 0 11.82-5.29 11.82-11.82 0-3.16-1.23-6.12-3.39-8.38Zm-8.46 18.2h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.82 1.04 1.02-3.72-.24-.38a9.83 9.83 0 0 1-1.52-5.29c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.1 1.02 6.96 2.88a9.78 9.78 0 0 1 2.89 6.97c0 5.43-4.43 9.85-9.87 9.85Zm5.43-7.37c-.3-.15-1.76-.86-2.03-.96-.27-.1-.46-.15-.65.15-.19.3-.75.96-.93 1.16-.19.2-.34.23-.63.08-.3-.16-1.27-.47-2.42-1.5-.9-.8-1.51-1.79-1.69-2.09-.18-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.65-1.55-.89-2.12-.23-.55-.47-.48-.65-.49l-.56-.01c-.2 0-.53.07-.8.38-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.22 1.35.19 1.86.11.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.19-.57-.34Z"/>
                </svg>
              </a>
              <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden whitespace-nowrap rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
                Need help? Chat with us
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-0.5 h-0 w-0 border-y-4 border-y-transparent border-l-4 border-l-black" />
              </div>
            </div>

            {/* Cart */}
            <CartModal />
          </div>
        </div>

        {/* Row 2: Desktop Navigation centered (extra compact) */}
        <div className="hidden md:flex justify-center py-0 bg-transparent border-t border-neutral-200 dark:border-neutral-800">
          <ul className="flex flex-wrap items-center gap-4 lg:gap-5 text-[13px] leading-5 font-medium text-neutral-700 dark:text-neutral-300">
            {(() => {
              const sorted = staticCollections.sort((a, b) => a.sortOrder - b.sortOrder);
              return sorted.map((collection) => (
                <li key={collection.id}>
                  <Link
                    href="/search"
                    prefetch
                    className="relative transition-colors hover:text-black dark:hover:text-white after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-all hover:after:w-full"
                  >
                    {collection.title}
                  </Link>
                </li>
              ));
            })()}
          </ul>
        </div>
      </div>

      {/* Mobile menu content moved into MobileMenu component */}
    </nav>
  );
}
