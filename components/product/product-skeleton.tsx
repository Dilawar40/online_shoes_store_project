import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4">
      <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-black md:p-12 lg:flex-row lg:gap-8">
        {/* Left: Image Gallery Skeleton */}
        <div className="h-full w-full basis-full lg:basis-4/6">
          <div className="w-full max-w-[600px] mx-auto">
            <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse">
                  <Skeleton className="w-full h-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Product Info Skeleton */}
        <div className="basis-full lg:basis-2/6 mt-8 lg:mt-0">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="mt-8 space-y-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
