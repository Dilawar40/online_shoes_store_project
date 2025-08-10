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
      <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-8 px-4 pb-4 text-black md:flex-row dark:text-white">
        <div className="order-first w-full flex-none md:max-w-[125px]">
          <Collections
            params={{ collection: params?.collection ?? "defaultCollection" }}
          />
        </div>
        <div className="order-last min-h-screen w-full md:order-none">
          <Suspense fallback={null}>
            <ChildrenWrapper>{children}</ChildrenWrapper>
          </Suspense>
        </div>
        <div className="order-none flex-none md:order-last md:w-[125px]">
          <FilterList list={sorting} title="Sort by" />
        </div>
      </div>
      <Footer />
    </>
  );
}
