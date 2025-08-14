import FilterList from "@/app/components/search/filter";
import ChildrenWrapper from "./children-wrapper";
import { Suspense } from "react";
import Footer from "@/app/components/footer";
import Collections from "@/app/components/search/collections";
import { sorting } from "@/app/lib/constants";

export default function SearchLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { collection?: string };
}) {
  return (
    <>
      <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-8  pb-4 text-black md:flex-row dark:text-white">
      
        <div className="order-last min-h-screen w-full px-4 md:order-none md:px-0">
          <Suspense fallback={null}>
            <ChildrenWrapper>{children}</ChildrenWrapper>
          </Suspense>
        </div>
     
      </div>
      <Footer />
    </>
  );
}
