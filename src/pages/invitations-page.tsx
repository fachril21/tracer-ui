import { MailOpen } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { InvitationCard } from "@/components/project/invitation-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth-context";

function InvitationsPage() {
  const { invitations, projects, acceptInvitation, declineInvitation } = useAuth();
  const navigate = useNavigate();
  const home = projects[0] === undefined ? "/" : `/p/${projects[0].id}`;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-page-title font-semibold text-ink">Undangan project</h1>
        <p className="text-body text-mute">Undangan yang menunggu jawaban Anda.</p>
      </header>

      {invitations.length === 0 ? (
        <section
          aria-label="Tidak ada undangan"
          className="flex flex-col items-center gap-2 rounded-lg border border-hairline bg-canvas px-6 py-14 text-center"
        >
          <MailOpen className="size-5 text-stone" aria-hidden="true" />
          <p className="text-heading-sm font-semibold text-ink">Tidak ada undangan</p>
          <p className="max-w-sm text-body text-mute">
            Saat seseorang mengundang Anda ke project, undangannya muncul di sini.
          </p>
          <Link to={home} className={cn(buttonVariants({ variant: "secondary" }), "mt-2")}>
            Kembali ke beranda
          </Link>
        </section>
      ) : (
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
      )}
    </div>
  );
}

export { InvitationsPage };
