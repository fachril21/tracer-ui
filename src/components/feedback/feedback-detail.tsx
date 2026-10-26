import { Check, Eye, Play, RotateCcw, Star } from "lucide-react";
import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { KIND_LABEL, STATUS_LABEL } from "@/mock/feedback";
import type { FeedbackItem, FeedbackStatus } from "@/mock/feedback";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Nilai ${rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          aria-hidden="true"
          className={cn("size-3.5", value <= rating ? "fill-warning-text text-warning-text" : "text-border-control")}
        />
      ))}
    </span>
  );
}

type FeedbackDetailProps = {
  item: FeedbackItem;
  projectId: string;
  onStatus: (id: string, status: FeedbackStatus) => void;
};

function FeedbackDetail({ item, projectId, onStatus }: FeedbackDetailProps) {
  return (
    <article aria-label="Detail masukan" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Stars rating={item.rating} />
          <span className="text-caption font-medium text-charcoal">{KIND_LABEL[item.kind]}</span>
          <span className="text-caption text-mute">{STATUS_LABEL[item.status]}</span>
        </div>
        <p className="text-body-lg text-ink">{item.message}</p>
      </div>

      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-caption">
        <dt className="text-mute">Diterima</dt>
        <dd className="font-mono tabular-nums text-ink">{formatDateTime(item.createdAt)}</dd>
        <dt className="text-mute">Halaman</dt>
        <dd className="truncate font-mono text-ink">{item.page}</dd>
        <dt className="text-mute">Perangkat</dt>
        <dd className="text-ink">{item.device}</dd>
        <dt className="text-mute">Email</dt>
        <dd className="truncate text-ink">{item.email ?? "Tidak diisi"}</dd>
      </dl>

      <div className="flex flex-wrap gap-2">
        {item.sessionId === null ? (
          <p className="text-caption text-mute">Tidak ada rekaman sesi yang menyertai masukan ini.</p>
        ) : (
          <Link
            to={`/p/${projectId}/sessions/${item.sessionId}`}
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            <Play aria-hidden="true" />
            Lihat sesinya
          </Link>
        )}
        {item.status === "selesai" ? (
          <Button onClick={() => onStatus(item.id, "dibaca")}>
            <RotateCcw aria-hidden="true" />
            Buka lagi
          </Button>
        ) : (
          <>
            {item.status === "baru" ? (
              <Button onClick={() => onStatus(item.id, "dibaca")}>
                <Eye aria-hidden="true" />
                Tandai dibaca
              </Button>
            ) : null}
            <Button onClick={() => onStatus(item.id, "selesai")}>
              <Check aria-hidden="true" />
              Tandai selesai
            </Button>
          </>
        )}
      </div>
    </article>
  );
}

export { FeedbackDetail, Stars };
