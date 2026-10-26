import { TriangleAlert } from "lucide-react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function describeError(error: unknown): string {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`;
  if (error instanceof Error) return error.message;
  return "Galat tidak dikenal";
}

// Layar galat sendiri, menggantikan layar bawaan router yang berbahasa Inggris
function RouteErrorPage() {
  const error = useRouteError();

  return (
    <main className="flex min-h-svh items-center justify-center bg-paper px-4">
      <section
        role="alert"
        aria-labelledby="judul-galat"
        className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-danger-text/40 bg-canvas p-6"
      >
        <TriangleAlert className="size-5 text-danger-text" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <h1 id="judul-galat" className="text-heading-lg font-semibold text-ink">
            Halaman ini gagal ditampilkan
          </h1>
          <p className="text-body text-mute">
            Terjadi masalah saat memuat halaman. Muat ulang untuk mencoba lagi, atau kembali ke beranda.
          </p>
        </div>
        <p className="break-words rounded-md bg-surface-soft p-3 font-mono text-mono text-charcoal">
          {describeError(error)}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Muat ulang
          </Button>
          <Link to="/" className={cn(buttonVariants({ variant: "secondary" }))}>
            Kembali ke beranda
          </Link>
        </div>
      </section>
    </main>
  );
}

export { RouteErrorPage };
