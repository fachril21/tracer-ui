import { Check, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/state/auth-context";
import { useDemo } from "@/state/demo-context";
import type { MotionSetting, ThemeSetting } from "@/state/demo-context";
import type { ProjectRole } from "@/mock/types";

const ROLE_LABELS: Record<ProjectRole, string> = {
  pemilik: "Pemilik",
  anggota: "Anggota",
  admin: "Admin",
};

const THEME_OPTIONS: { value: ThemeSetting; label: string }[] = [
  { value: "system", label: "Ikuti sistem" },
  { value: "light", label: "Terang" },
  { value: "dark", label: "Gelap" },
];

const MOTION_OPTIONS: { value: MotionSetting; label: string }[] = [
  { value: "system", label: "Ikuti sistem" },
  { value: "reduce", label: "Kurangi" },
  { value: "full", label: "Penuh" },
];

function AccountMenu() {
  const { theme, motion, role, setTheme, setMotion } = useDemo();
  const { user, signOut } = useAuth();
  const email = user?.email ?? "";
  const initial = (user?.name ?? email).slice(0, 1).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Akun ${email}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-body font-semibold text-on-primary transition-colors duration-[var(--motion-fast)] hover:bg-primary-pressed"
      >
        <span aria-hidden="true">{initial}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5">
          <p className="truncate text-body font-semibold text-ink">{email}</p>
          <p className="text-caption text-mute">{ROLE_LABELS[role]}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Tema</DropdownMenuLabel>
          {THEME_OPTIONS.map((option) => (
            <DropdownMenuItem key={option.value} onSelect={() => setTheme(option.value)}>
              <span className="flex-1">{option.label}</span>
              {theme === option.value ? <Check className="!text-primary" aria-label="Dipilih" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Gerakan</DropdownMenuLabel>
          {MOTION_OPTIONS.map((option) => (
            <DropdownMenuItem key={option.value} onSelect={() => setMotion(option.value)}>
              <span className="flex-1">{option.label}</span>
              {motion === option.value ? <Check className="!text-primary" aria-label="Dipilih" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut}>
          <LogOut aria-hidden="true" />
          <span className="flex-1">Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AccountMenu, ROLE_LABELS };
