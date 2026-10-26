import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDemo } from "@/state/demo-context";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getSystemDark = (): boolean => window.matchMedia(DARK_QUERY).matches;

// Satu klik membalik tampilan yang sedang terlihat. Pilihan "Ikuti sistem" tetap ada di panel demo.
function ThemeToggle() {
  const { theme, setTheme } = useDemo();
  const isSystemDark = useSyncExternalStore(subscribe, getSystemDark, () => false);
  const isDark = theme === "system" ? isSystemDark : theme === "dark";
  const label = isDark ? "Ganti ke tema terang" : "Ganti ke tema gelap";
  const Icon = isDark ? Sun : Moon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label={label}>
          <Icon aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export { ThemeToggle };
