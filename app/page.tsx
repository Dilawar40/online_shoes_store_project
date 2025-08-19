import Footer from "./components/footer";
import HeroCarousel from "./components/HeroCarousel";
import SearchClient from "./search/[[...collection]]/search-client";

export const metadata = {
  description:
    "High-performance ecommerce store built with Next.js, Vercel, and Shopify.",
  openGraph: {
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main>
      <HeroCarousel />
      <div className="bg-white">
        <SearchClient/>
      </div>
      <Footer />
    </main>
  );
}
