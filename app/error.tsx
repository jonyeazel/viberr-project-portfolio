"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-[320px]">
        <p className="text-[15px] font-semibold text-foreground">
          Something went wrong
        </p>
        <p className="text-[13px] text-muted mt-2 leading-[1.5]">
          An unexpected error occurred. This has been logged.
        </p>
        <button
          onClick={reset}
          className="mt-6 h-9 px-4 rounded-md bg-foreground text-background text-[12px] font-medium hover:opacity-85 transition-opacity duration-150"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
