import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

// Ilustrasi garis wireframe satu warna: kerangka halaman dengan satu simpul jejak
function WireframeIllustration() {
  return (
    <svg
      width="96"
      height="64"
      viewBox="0 0 96 64"
      fill="none"
      aria-hidden="true"
      className="text-stone"
    >
      <rect x="1" y="1" width="94" height="62" rx="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="1" y1="14" x2="95" y2="14" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="30" x2="52" y2="30" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="42" x2="68" y2="42" stroke="currentColor" strokeWidth="1.5" />
      <rect x="72" y="26" width="8" height="8" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
    </svg>
  );
}

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <WireframeIllustration />
      <div className="flex flex-col gap-1">
        <p className="text-heading-sm font-semibold text-ink">{title}</p>
        <p className="max-w-sm text-body text-mute">{description}</p>
      </div>
      {action === undefined ? null : <div className="mt-1">{action}</div>}
    </div>
  );
}

export { EmptyState };
