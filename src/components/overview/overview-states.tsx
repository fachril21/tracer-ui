import { CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

// Kerangka mengikuti ukuran konten asli supaya tata letak tidak melompat
function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <p role="status" className="sr-only">
        Memuat ikhtisar…
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="flex flex-col gap-4 rounded-lg border border-hairline bg-canvas p-5 xl:col-span-8">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-56 w-full" />
        </div>
        <div className="flex flex-col gap-4 rounded-lg border border-hairline bg-canvas p-5 xl:col-span-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas p-5">
        <Skeleton className="h-5 w-48" />
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

function OverviewError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section
      role="alert"
      aria-label="Gagal memuat ikhtisar"
      className="flex flex-col gap-3 rounded-lg border border-danger-solid bg-danger-bg p-5"
    >
      <p className="flex items-start gap-2 text-body-lg font-semibold text-danger-text">
        <CircleX className="mt-1 size-4 shrink-0" aria-hidden="true" />
        Gagal memuat ikhtisar
      </p>
      <p className="max-w-prose text-body text-danger-text">{message}</p>
      <div>
        <Button variant="secondary" onClick={onRetry}>
          Coba Lagi
        </Button>
      </div>
    </section>
  );
}

function OverviewEmpty({ onShowLonger }: { onShowLonger: () => void }) {
  return (
    <section
      aria-label="Belum ada data"
      className="rounded-lg border border-hairline bg-canvas"
    >
      <EmptyState
        title="Belum ada sesi pada rentang ini"
        description="Pemasangan sudah terdeteksi, tetapi belum ada sesi dalam periode yang dipilih. Coba perluas rentang waktu."
        action={
          <Button variant="secondary" onClick={onShowLonger}>
            Lihat 30 hari
          </Button>
        }
      />
    </section>
  );
}

function OverviewNoMatch({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <section aria-label="Tidak ada hasil" className="rounded-lg border border-hairline bg-canvas">
      <EmptyState
        title="Tidak ada sesi yang cocok"
        description="Kombinasi filter ini terlalu sempit untuk rentang waktu yang dipilih. Hapus satu filter atau perluas rentang."
        action={
          <Button variant="secondary" onClick={onClearFilters}>
            Hapus semua filter
          </Button>
        }
      />
    </section>
  );
}

export { OverviewEmpty, OverviewError, OverviewNoMatch, OverviewSkeleton };
