import { useEffect } from "react";
import { useLocation } from "react-router";
import { buildDocumentTitle } from "@/lib/route-labels";
import { useActiveProject } from "@/state/use-active-project";

// Setiap pindah halaman, judul tab ikut berubah supaya pembaca layar dan riwayat peramban tahu posisinya
function useDocumentTitle(): void {
  const { pathname } = useLocation();
  const { project } = useActiveProject();
  const projectName = project?.name ?? null;

  useEffect(() => {
    document.title = buildDocumentTitle(pathname, projectName);
  }, [pathname, projectName]);
}

export { useDocumentTitle };
