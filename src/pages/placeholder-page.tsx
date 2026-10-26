import { Hammer } from "lucide-react";
import { useDemo } from "@/state/demo-context";
import { useActiveProject } from "@/state/use-active-project";

type PlaceholderPageProps = {
  title: string;
  summary: string;
  // Arah revamp dari DESIGN.md untuk halaman ini
  plan: string[];
  adminOnly?: boolean;
};

function PlaceholderPage({ title, summary, plan, adminOnly = false }: PlaceholderPageProps) {
  const { role } = useDemo();
  const { project } = useActiveProject();

  if (adminOnly && role !== "admin") {
    return (
      <section
        aria-label="Halaman khusus admin"
        className="flex flex-col items-center gap-2 rounded-lg border border-hairline bg-canvas px-6 py-14 text-center"
      >
        <p className="text-heading-sm font-semibold text-ink">Halaman khusus admin</p>
        <p className="max-w-sm text-body text-mute">
          Ganti peran ke Admin lewat panel demo untuk melihat halaman ini.
        </p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-page-title font-semibold text-ink">{title}</h1>
        {project === null ? null : <p className="font-mono text-caption text-mute">{project.name}</p>}
      </header>
      <section
        aria-label="Status revamp"
        className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas p-5"
      >
        <p className="flex items-center gap-2 font-mono text-label uppercase tracking-[0.06em] text-stone">
          <Hammer className="size-3.5" aria-hidden="true" />
          Belum direvamp
        </p>
        <p className="max-w-prose text-body text-charcoal">{summary}</p>
        <ul className="flex max-w-prose list-disc flex-col gap-1 pl-5 text-body text-mute">
          {plan.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export { PlaceholderPage };
