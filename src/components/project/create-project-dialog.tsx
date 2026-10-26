import { useState } from "react";
import { useNavigate } from "react-router";
import { CreateProjectForm } from "@/components/project/create-project-form";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type CreateProjectDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

function CreateProjectDialog({ isOpen, onOpenChange }: CreateProjectDialogProps) {
  const navigate = useNavigate();
  const [isBusy, setBusy] = useState(false);

  // Dialog tidak boleh ditutup di tengah proses
  const handleOpenChange = (open: boolean) => {
    if (isBusy) return;
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-2">
          <DialogTitle className="text-heading-md font-semibold text-ink">Buat project baru</DialogTitle>
          <DialogDescription className="text-body text-mute">
            Satu project untuk satu website. Setelah dibuat, Anda langsung dibawa ke langkah pemasangan.
          </DialogDescription>
        </div>
        <CreateProjectForm
          onBusyChange={setBusy}
          onCancel={() => onOpenChange(false)}
          onCreated={(project) => {
            onOpenChange(false);
            navigate(`/p/${project.id}/installation`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export { CreateProjectDialog };
