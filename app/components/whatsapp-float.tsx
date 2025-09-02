import Link from "next/link";

// Global floating WhatsApp button with hover tooltip
export default function WhatsAppFloat() {
  const phone = "923156822958"; // update if needed
  const href = `https://wa.me/${phone}`;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div className="relative group">
        {/* Tooltip */}
        <div className="pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden whitespace-nowrap rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
          Need help? Chat with us
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-0.5 h-0 w-0 border-y-4 border-y-transparent border-l-4 border-l-black" />
        </div>

        {/* Button */}
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="inline-flex items-center justify-center h-12 w-12 rounded-full border border-neutral-200 bg-white text-green-600 shadow-md transition-transform hover:scale-105 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.53 0 .24 5.29.24 11.82c0 2.08.55 4.11 1.59 5.9L0 24l6.44-1.75a11.8 11.8 0 0 0 5.62 1.43h.01c6.53 0 11.82-5.29 11.82-11.82 0-3.16-1.23-6.12-3.39-8.38Zm-8.46 18.2h-.01a9.83 9.83 0 0 1-5.01-1.37l-.36-.21-3.82 1.04 1.02-3.72-.24-.38a9.83 9.83 0 0 1-1.52-5.29c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.1 1.02 6.96 2.88a9.78 9.78 0 0 1 2.89 6.97c0 5.43-4.43 9.85-9.87 9.85Zm5.43-7.37c-.3-.15-1.76-.86-2.03-.96-.27-.1-.46-.15-.65.15-.19.3-.75.96-.93 1.16-.19.2-.34.23-.63.08-.3-.16-1.27-.47-2.42-1.5-.9-.8-1.51-1.79-1.69-2.09-.18-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.65-1.55-.89-2.12-.23-.55-.47-.48-.65-.49l-.56-.01c-.2 0-.53.07-.8.38-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.22 1.35.19 1.86.11.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.19-.57-.34Z"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}
