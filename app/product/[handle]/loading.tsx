import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Gallery Skeleton */}
        <div className="w-full lg:w-2/3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-md" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="w-full lg:w-1/3 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          
          <div className="pt-4 space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
