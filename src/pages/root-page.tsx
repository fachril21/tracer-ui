import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { InvitationCard } from "@/components/project/invitation-card";
import { CreateProjectForm } from "@/components/project/create-project-form";
import { useAuth } from "@/state/auth-context";

const STEPS = [
  { title: "Buat project", body: "Beri nama dan alamat website yang akan direkam." },
  { title: "Pasang skrip", body: "Tempel satu baris skrip di website. Kami tunjukkan caranya." },
  { title: "Lihat sesi pertama", body: "Rekaman dan peta muncul begitu ada pengunjung." },
];

// Beranda tanpa project: undangan dulu bila ada, lalu pembuatan project pertama
function RootPage() {
  const { user, projects, invitations, acceptInvitation, declineInvitation } = useAuth();
  const navigate = useNavigate();
  // Hanya dicek saat halaman dibuka: setelah membuat project atau menerima undangan, tujuan ditentukan oleh aksinya
  const [initialFirstId] = useState(projects[0]?.id);
  if (initialFirstId !== undefined) return <Navigate to={`/p/${initialFirstId}`} replace />;

  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 py-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-page-title font-semibold text-ink">
          {firstName === "" ? "Selamat datang di Tracer" : `Selamat datang, ${firstName}`}
        </h1>
        <p className="max-w-prose text-body text-mute">
          {invitations.length > 0
            ? "Anda punya undangan ke project yang sudah ada. Terima untuk langsung melihat datanya, atau buat project sendiri."
            : "Belum ada project di akun ini. Buat project pertama Anda, pemasangannya hanya satu langkah."}
        </p>
      </header>

      {invitations.length === 0 ? null : (
        <section aria-labelledby="undangan-judul" className="flex flex-col gap-3">
          <h2 id="undangan-judul" className="text-heading-md font-semibold text-ink">
            Undangan untuk Anda ({invitations.length})
          </h2>
          <ul className="flex flex-col gap-3">
            {invitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onAccept={(item) => {
                  acceptInvitation(item.id);
                  navigate(`/p/${item.projectId}`);
                }}
                onDecline={(item) => declineInvitation(item.id)}
              />
            ))}
          </ul>
        </section>
      )}

      <section
        aria-labelledby="buat-judul"
        className="flex flex-col gap-4 rounded-lg border border-hairline bg-canvas p-5"
      >
        <header className="flex flex-col gap-1">
          <h2 id="buat-judul" className="text-heading-md font-semibold text-ink">
            {invitations.length > 0 ? "Atau buat project sendiri" : "Buat project pertama"}
          </h2>
          <p className="text-body text-mute">Satu project untuk satu website.</p>
        </header>
        <CreateProjectForm onCreated={(project) => navigate(`/p/${project.id}/installation`)} />
      </section>

      <section aria-label="Langkah awal">
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3 sm:flex-col">
              <span className="font-mono text-caption text-stone">0{index + 1}</span>
              <div className="flex flex-col gap-1">
                <p className="text-body font-semibold text-ink">{step.title}</p>
                <p className="text-caption text-mute">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export { RootPage };
