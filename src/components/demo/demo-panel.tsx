import { useEffect } from "react";
import type { ReactNode } from "react";
import { FlaskConical, RotateCcw, X } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { IS_DEMO_ENABLED } from "@/lib/demo-flag";
import type { AuthScenario } from "@/mock/auth-service";
import type { ProjectRole } from "@/mock/types";
import { useAuth } from "@/state/auth-context";
import { useDemo } from "@/state/demo-context";
import type {
  AiScenario,
  DensitySetting,
  LiveScenario,
  MotionSetting,
  OverviewScenario,
  ThemeSetting,
} from "@/state/demo-context";

const AUTH_SCENARIO_OPTIONS: { value: AuthScenario; label: string }[] = [
  { value: "berhasil", label: "Berhasil" },
  { value: "kode-salah", label: "Kode salah" },
  { value: "kedaluwarsa", label: "Kedaluwarsa" },
  { value: "terlalu-banyak", label: "Terlalu banyak percobaan" },
  { value: "batas-kirim", label: "Batas kirim kode" },
  { value: "galat-jaringan", label: "Jaringan galat" },
];

const WORKSPACE_KEY_PREFIXES = ["tracer-uiux:workspace:", "tracer-uiux:config:", "tracer-uiux:feedback:", "tracer-uiux:funnels:"];

// Menghapus project buatan, undangan yang sudah dijawab, dan pengaturan project tiruan
function clearDemoData(): void {
  try {
    const keys: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key !== null && WORKSPACE_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Penyimpanan bisa diblokir; tidak ada yang perlu dibersihkan
  }
}

const SCENARIO_OPTIONS: { value: OverviewScenario; label: string }[] = [
  { value: "alami", label: "Alami" },
  { value: "memuat", label: "Memuat" },
  { value: "kosong", label: "Kosong" },
  { value: "galat", label: "Galat" },
  { value: "menunggu", label: "Menunggu pemasangan" },
];

const LIVE_OPTIONS: { value: LiveScenario; label: string }[] = [
  { value: "ramai", label: "Ramai" },
  { value: "sepi", label: "Sepi" },
  { value: "kosong", label: "Kosong" },
  { value: "terputus", label: "Terputus" },
];

const AI_OPTIONS: { value: AiScenario; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "galat", label: "Galat" },
  { value: "batas", label: "Batas harian" },
];

const ROLE_OPTIONS: { value: ProjectRole; label: string }[] = [
  { value: "pemilik", label: "Pemilik" },
  { value: "anggota", label: "Anggota" },
  { value: "admin", label: "Admin" },
];

const THEME_OPTIONS: { value: ThemeSetting; label: string }[] = [
  { value: "system", label: "Sistem" },
  { value: "light", label: "Terang" },
  { value: "dark", label: "Gelap" },
];

const MOTION_OPTIONS: { value: MotionSetting; label: string }[] = [
  { value: "system", label: "Sistem" },
  { value: "reduce", label: "Kurangi" },
  { value: "full", label: "Penuh" },
];

const DENSITY_OPTIONS: { value: DensitySetting; label: string }[] = [
  { value: "padat", label: "Padat" },
  { value: "lega", label: "Lega" },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-label uppercase tracking-[0.06em] text-stone">{label}</p>
      {children}
      {hint === undefined ? null : <p className="text-caption text-mute">{hint}</p>}
    </div>
  );
}

function DemoPanel() {
  const demo = useDemo();
  const { status, signOut, expire } = useAuth();
  const navigate = useNavigate();
  const isSignedIn = status === "authenticated";

  // Alt+D membuka atau menutup panel
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        demo.setPanelOpen(!demo.isPanelOpen);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [demo]);

  if (!IS_DEMO_ENABLED) return null;

  const runFlow = (flow: { path: string; scenario: OverviewScenario; role?: ProjectRole }) => {
    demo.setOverviewScenario(flow.scenario);
    if (flow.role !== undefined) demo.setRole(flow.role);
    navigate(flow.path);
  };

  return (
    <>
      {demo.isPanelOpen ? null : (
        <Button
          variant="primary"
          className="fixed bottom-4 right-4 z-40 h-9 rounded-full bg-ink px-3.5 text-paper shadow-overlay hover:bg-charcoal"
          onClick={() => demo.setPanelOpen(true)}
          aria-label="Buka panel demo"
        >
          <FlaskConical aria-hidden="true" />
          Demo
        </Button>
      )}

      <Sheet open={demo.isPanelOpen} onOpenChange={demo.setPanelOpen} modal={false}>
        <SheetContent
          side="right"
          showOverlay={false}
          aria-describedby="demo-panel-desc"
          className="w-[360px] max-w-full"
          onInteractOutside={(event) => event.preventDefault()}
        >
          <header className="flex items-start justify-between gap-3 border-b border-hairline p-4">
            <div className="flex flex-col gap-1">
              <SheetTitle className="flex items-center gap-2 text-heading-md font-semibold text-ink">
                <FlaskConical className="size-4 text-primary" aria-hidden="true" />
                Panel demo
              </SheetTitle>
              <SheetDescription id="demo-panel-desc" className="text-caption text-mute">
                Simulasi UI dan UX dengan data tiruan. Tidak terhubung ke backend. Alt+D untuk buka atau tutup.
              </SheetDescription>
            </div>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" aria-label="Tutup panel demo">
                <X />
              </Button>
            </SheetClose>
          </header>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
            <Field
              label="Alur masuk"
              hint="Kode demo 123456. Email berakhiran @luar.id ditolak saat mengundang anggota. Awalan admin, baru, atau diundang menentukan jenis akun."
            >
              <Segmented
                label="Hasil dari server"
                value={demo.authScenario}
                options={AUTH_SCENARIO_OPTIONS}
                onChange={demo.setAuthScenario}
              />
              <div className="flex flex-col gap-2">
                <Button className="justify-start" disabled={!isSignedIn} onClick={expire}>
                  Simulasikan sesi berakhir
                </Button>
                <Button
                  className="justify-start"
                  disabled={!isSignedIn}
                  onClick={() => {
                    clearDemoData();
                    signOut();
                  }}
                >
                  Keluar dan hapus data akun demo
                </Button>
                {isSignedIn ? null : (
                  <Button className="justify-start" onClick={() => navigate("/login")}>
                    Ke layar masuk
                  </Button>
                )}
              </div>
            </Field>

            <Field label="Flow cepat">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => runFlow({ path: "/p/kopi-senja", scenario: "alami", role: "pemilik" })}
                  className="justify-start"
                >
                  Project aktif dengan data penuh
                </Button>
                <Button
                  onClick={() => runFlow({ path: "/p/klinik-sehat", scenario: "alami", role: "pemilik" })}
                  className="justify-start"
                >
                  Project baru, belum terpasang
                </Button>
                <Button
                  onClick={() => runFlow({ path: "/p/karir-nusa", scenario: "alami", role: "admin" })}
                  className="justify-start"
                >
                  Admin melihat project orang lain
                </Button>
                <Button
                  onClick={() => runFlow({ path: "/p/kopi-senja", scenario: "galat", role: "pemilik" })}
                  className="justify-start"
                >
                  Layanan analisis galat
                </Button>
                <Button
                  onClick={() =>
                    runFlow({
                      path: "/p/kopi-senja?device=Mobile&signal=rage_click&range=30",
                      scenario: "alami",
                      role: "pemilik",
                    })
                  }
                  className="justify-start"
                >
                  Mobile dengan rage click, 30 hari
                </Button>
                <Button
                  onClick={() =>
                    runFlow({
                      path: "/p/kopi-senja?device=Tablet&source=Email&signal=js_error&page=%2Fakun%2Fpesanan",
                      scenario: "alami",
                      role: "pemilik",
                    })
                  }
                  className="justify-start"
                >
                  Filter tanpa hasil
                </Button>
                <Button
                  onClick={() =>
                    runFlow({
                      path: "/p/kopi-senja/sessions?problem=1&range=30",
                      scenario: "alami",
                      role: "pemilik",
                    })
                  }
                  className="justify-start"
                >
                  Histori sesi bermasalah, 30 hari
                </Button>
              </div>
            </Field>

            <Field label="Skenario Ikhtisar" hint="Mengubah keadaan data di halaman Ikhtisar.">
              <Segmented
                label="Skenario Ikhtisar"
                value={demo.overviewScenario}
                options={SCENARIO_OPTIONS}
                onChange={demo.setOverviewScenario}
              />
            </Field>

            <Field label="Skenario Live Users" hint="Jumlah pengunjung aktif dan keadaan sambungan di halaman Live Users.">
              <Segmented label="Skenario Live Users" value={demo.liveScenario} options={LIVE_OPTIONS} onChange={demo.setLiveScenario} />
            </Field>

            <Field label="Skenario asisten AI" hint="Galat menolak setiap pertanyaan. Batas harian mengunci kolom tanya.">
              <Segmented label="Skenario asisten AI" value={demo.aiScenario} options={AI_OPTIONS} onChange={demo.setAiScenario} />
            </Field>

            <Field label="Peran" hint="Admin membuka grup Admin di sidebar dan banner mode lihat saja.">
              <Segmented label="Peran" value={demo.role} options={ROLE_OPTIONS} onChange={demo.setRole} />
            </Field>

            <Field label="Tema">
              <Segmented label="Tema" value={demo.theme} options={THEME_OPTIONS} onChange={demo.setTheme} />
            </Field>

            <Field label="Gerakan" hint="Kurangi menghapus transisi dan animasi dekoratif.">
              <Segmented label="Gerakan" value={demo.motion} options={MOTION_OPTIONS} onChange={demo.setMotion} />
            </Field>

            <Field label="Kepadatan daftar">
              <Segmented
                label="Kepadatan daftar"
                value={demo.density}
                options={DENSITY_OPTIONS}
                onChange={demo.setDensity}
              />
            </Field>
          </div>

          <footer className="border-t border-hairline p-4">
            <Button variant="secondary" onClick={demo.resetAll} className="w-full">
              <RotateCcw aria-hidden="true" />
              Reset semua
            </Button>
          </footer>
        </SheetContent>
      </Sheet>
    </>
  );
}

export { DemoPanel };
