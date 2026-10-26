import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Check, Eye, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router";
import { DeleteProjectDialog } from "@/components/project/delete-project-dialog";
import { MembersEditor } from "@/components/project/members-editor";
import { OriginEditor } from "@/components/project/origin-editor";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";
import { useAuth } from "@/state/auth-context";
import { useDemo } from "@/state/demo-context";
import { useActiveProject } from "@/state/use-active-project";
import { useProjectConfig } from "@/state/use-project-config";

const SECTIONS = [
  { id: "umum", label: "Umum" },
  { id: "origin-sesi", label: "Origin sesi" },
  { id: "origin-gambar", label: "Origin gambar" },
  { id: "anggota", label: "Anggota" },
  { id: "zona-bahaya", label: "Zona bahaya" },
] as const;

type SectionProps = {
  id: (typeof SECTIONS)[number]["id"];
  title: string;
  description: string;
  children: ReactNode;
  isDanger?: boolean;
};

// Setiap bagian punya judul dan penjelasan di kiri atas, isi di bawahnya. Zona bahaya diberi penanda sendiri.
function Section({ id, title, description, children, isDanger = false }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-judul`}
      className={
        isDanger
          ? "flex scroll-mt-20 flex-col gap-4 rounded-lg border border-danger-text/40 bg-canvas p-5"
          : "flex scroll-mt-20 flex-col gap-4 rounded-lg border border-hairline bg-canvas p-5"
      }
    >
      <header className="flex flex-col gap-1">
        <h2
          id={`${id}-judul`}
          className={isDanger ? "flex items-center gap-2 text-heading-md font-semibold text-danger-text" : "text-heading-md font-semibold text-ink"}
        >
          {isDanger ? <TriangleAlert className="size-4" aria-hidden="true" /> : null}
          {title}
        </h2>
        <p className="max-w-prose text-body text-mute">{description}</p>
      </header>
      {children}
    </section>
  );
}

function SettingsPage() {
  const { role } = useDemo();
  const { projects, removeProject } = useAuth();
  const { project } = useActiveProject();
  const { config, update, reset } = useProjectConfig(project?.id ?? "");
  const navigate = useNavigate();
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [isSaved, setSaved] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  if (project === null) return null;

  const canEdit = role === "pemilik";
  const name = nameDraft ?? config.name;
  const isDirty = name.trim() !== config.name && name.trim() !== "";

  const handleSaveName = (event: FormEvent) => {
    event.preventDefault();
    if (!isDirty) return;
    update({ name: name.trim() });
    setNameDraft(null);
    setSaved(true);
  };

  const handleDeleted = () => {
    setDeleteOpen(false);
    reset();
    const next = projects.find((item) => item.id !== project.id);
    removeProject(project.id);
    navigate(next === undefined ? "/" : `/p/${next.id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-page-title font-semibold text-ink">Pengaturan Project</h1>
        <p className="font-mono text-caption text-mute">{config.name}</p>
      </header>

      {canEdit ? null : (
        <p role="note" className="flex items-start gap-2 rounded-lg border border-hairline bg-surface-soft p-3 text-body text-charcoal">
          <Eye className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {role === "anggota"
            ? "Anda anggota project ini. Pengaturan hanya bisa dilihat, perubahan dilakukan oleh pemilik."
            : "Mode lihat saja. Perubahan hanya dapat dilakukan oleh pemilik project."}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <nav aria-label="Bagian pengaturan" className="lg:sticky lg:top-20 lg:self-start">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SECTIONS.map((section) => (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  className="block rounded-md px-3 py-1.5 text-body text-charcoal hover:bg-surface-hover"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex max-w-3xl flex-col gap-6">
          <Section id="umum" title="Umum" description="Nama project tampil di pemilih project dan di judul halaman.">
            <form onSubmit={handleSaveName} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <TextField
                  label="Nama project"
                  value={name}
                  disabled={!canEdit}
                  onChange={(event) => {
                    setNameDraft(event.target.value);
                    setSaved(false);
                  }}
                  autoComplete="off"
                />
              </div>
              {canEdit ? (
                <Button type="submit" variant="primary" disabled={!isDirty} className="sm:mt-[22px]">
                  Simpan
                </Button>
              ) : null}
            </form>
            <div role="status" aria-live="polite" className="min-h-5">
              {isSaved ? (
                <p className="flex items-center gap-2 text-caption text-success-text">
                  <Check className="size-3.5" aria-hidden="true" />
                  Nama project tersimpan.
                </p>
              ) : null}
            </div>
          </Section>

          <Section
            id="origin-sesi"
            title="Origin sesi"
            description="Website yang boleh memulai sesi. Sesi dari origin lain ditolak."
          >
            <OriginEditor
              label="Origin sesi terdaftar"
              origins={config.origins}
              onChange={(origins) => update({ origins })}
              canEdit={canEdit}
              emptyText="Belum ada origin. Tanpa origin terdaftar, tidak ada sesi yang masuk."
            />
          </Section>

          <Section
            id="origin-gambar"
            title="Origin gambar"
            description="Domain aset gambar yang boleh dimuat saat rekaman diputar ulang, misalnya CDN website."
          >
            <OriginEditor
              label="Origin gambar terdaftar"
              origins={config.imageOrigins}
              onChange={(imageOrigins) => update({ imageOrigins })}
              canEdit={canEdit}
              placeholder="https://cdn.contoh.id"
              emptyText="Belum ada. Gambar dari domain lain tampil sebagai kotak kosong saat rekaman diputar."
            />
          </Section>

          <Section id="anggota" title="Anggota" description="Orang yang bisa melihat data project ini.">
            <MembersEditor members={config.members} onChange={(members) => update({ members })} canEdit={canEdit} />
          </Section>

          <Section
            id="zona-bahaya"
            title="Zona bahaya"
            description="Tindakan di sini tidak bisa dibatalkan."
            isDanger
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-prose text-body text-charcoal">
                Hapus project beserta seluruh sesi, rekaman, dan peta yang tersimpan.
              </p>
              <Button variant="destructive" disabled={!canEdit} onClick={() => setDeleteOpen(true)}>
                Hapus project
              </Button>
            </div>
            {canEdit ? null : <p className="text-caption text-mute">Hanya pemilik project yang bisa menghapus.</p>}
          </Section>
        </div>
      </div>

      <DeleteProjectDialog
        projectName={config.name}
        isOpen={isDeleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

export { SettingsPage };
