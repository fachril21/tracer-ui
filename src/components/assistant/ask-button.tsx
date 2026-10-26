import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssistant } from "@/state/assistant-context";
import type { AssistantRequest } from "@/mock/assistant";

type AskButtonProps = {
  request: AssistantRequest;
  // Kalimat yang tampil di percakapan sebagai pertanyaan
  label: string;
  children: string;
};

// Titik masuk asisten dari halaman lain. Panel hanya terbuka karena klik ini.
function AskButton({ request, label, children }: AskButtonProps) {
  const { ask } = useAssistant();
  return (
    <Button onClick={() => ask(request, label)}>
      <Sparkles aria-hidden="true" />
      {children}
    </Button>
  );
}

export { AskButton };
