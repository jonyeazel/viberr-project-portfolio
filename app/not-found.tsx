import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-[320px]">
        <p className="text-[15px] font-semibold text-foreground">
          Page not found
        </p>
        <p className="text-[13px] text-muted mt-2 leading-[1.5]">
          The project you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-9 px-4 items-center rounded-md bg-foreground text-background text-[12px] font-medium hover:opacity-85 transition-opacity duration-150"
        >
          Back to portfolio
        </Link>
      </div>
    </div>
  );
}
