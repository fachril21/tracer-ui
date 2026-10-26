import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router";
import { Wordmark } from "@/components/brand/logo";
import { buildLoginUrl, safeNextPath } from "@/lib/auth-paths";
import { useAuth } from "@/state/auth-context";

function SessionCheck() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-svh flex-col items-center justify-center gap-5 bg-canvas">
      <Wordmark />
      <div className="h-1 w-40 overflow-hidden rounded-xs bg-surface-active">
        <div className="animate-skeleton h-full w-1/3 rounded-xs bg-primary" />
      </div>
      <p className="text-caption text-mute">Memeriksa sesi…</p>
    </div>
  );
}

// Semua halaman aplikasi hanya untuk yang sudah masuk. Tamu dibawa ke layar masuk dan kembali setelahnya.
function RequireAuth() {
  const { status, lastExit } = useAuth();
  const location = useLocation();
  if (status === "loading") return <SessionCheck />;
  if (status === "guest") {
    const target =
      lastExit === "keluar"
        ? buildLoginUrl({ reason: "keluar" })
        : buildLoginUrl({
            next: `${location.pathname}${location.search}`,
            reason: lastExit === "berakhir" ? "berakhir" : undefined,
          });
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}

// Yang sudah masuk tidak perlu melihat layar masuk; arahkan ke tujuan semula
function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [params] = useSearchParams();
  if (status === "loading") return <SessionCheck />;
  if (status === "authenticated") return <Navigate to={safeNextPath(params.get("next")) ?? "/"} replace />;
  return children;
}

export { RedirectIfAuthed, RequireAuth };
