'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Product page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        We couldn't load the product details. Please try again or contact support if the problem persists.
      </p>
      <Button
        onClick={() => reset()}
        variant="outline"
        className="px-6 py-2"
      >
        Try Again
      </Button>
    </div>
  );
}
