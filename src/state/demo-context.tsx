import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthScenario } from "@/mock/auth-service";
import type { ProjectRole } from "@/mock/types";

type ThemeSetting = "system" | "light" | "dark";
type MotionSetting = "system" | "reduce" | "full";
type DensitySetting = "padat" | "lega";
type OverviewScenario = "alami" | "memuat" | "kosong" | "galat" | "menunggu";

type DemoSettings = {
  theme: ThemeSetting;
  motion: MotionSetting;
  role: ProjectRole;
  density: DensitySetting;
  sidebarCollapsed: boolean;
};

type DemoState = DemoSettings & {
  overviewScenario: OverviewScenario;
  authScenario: AuthScenario;
  isPanelOpen: boolean;
};

type DemoActions = {
  setTheme: (value: ThemeSetting) => void;
  setMotion: (value: MotionSetting) => void;
  setRole: (value: ProjectRole) => void;
  setDensity: (value: DensitySetting) => void;
  setSidebarCollapsed: (value: boolean) => void;
  setOverviewScenario: (value: OverviewScenario) => void;
  setAuthScenario: (value: AuthScenario) => void;
  setPanelOpen: (value: boolean) => void;
  resetAll: () => void;
};

const STORAGE_KEY = "tracer-uiux:demo";

const DEFAULT_SETTINGS: DemoSettings = {
  theme: "system",
  motion: "system",
  role: "pemilik",
  density: "padat",
  sidebarCollapsed: false,
};

const DEFAULT_STATE: DemoState = {
  ...DEFAULT_SETTINGS,
  overviewScenario: "alami",
  authScenario: "berhasil",
  isPanelOpen: false,
};

function readStoredSettings(): DemoSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(parsed as Partial<DemoSettings>) };
  } catch {
    // Penyimpanan bisa kosong atau diblokir, tampilan tetap jalan dengan bawaan
    return DEFAULT_SETTINGS;
  }
}

function writeStoredSettings(settings: DemoSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Diabaikan: preferensi demo hanya kenyamanan
  }
}

function applyAttribute(name: string, value: string | null): void {
  const root = document.documentElement;
  if (value === null) root.removeAttribute(name);
  else root.setAttribute(name, value);
}

const DemoContext = createContext<(DemoState & DemoActions) | null>(null);

function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => ({
    ...DEFAULT_STATE,
    ...readStoredSettings(),
  }));

  useEffect(() => {
    applyAttribute("data-theme", state.theme === "system" ? null : state.theme);
    applyAttribute("data-motion", state.motion === "system" ? null : state.motion);
    writeStoredSettings({
      theme: state.theme,
      motion: state.motion,
      role: state.role,
      density: state.density,
      sidebarCollapsed: state.sidebarCollapsed,
    });
  }, [state.theme, state.motion, state.role, state.density, state.sidebarCollapsed]);

  const patch = useCallback((update: Partial<DemoState>) => {
    setState((current) => ({ ...current, ...update }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setTheme: (theme: ThemeSetting) => patch({ theme }),
      setMotion: (motion: MotionSetting) => patch({ motion }),
      setRole: (role: ProjectRole) => patch({ role }),
      setDensity: (density: DensitySetting) => patch({ density }),
      setSidebarCollapsed: (sidebarCollapsed: boolean) => patch({ sidebarCollapsed }),
      setOverviewScenario: (overviewScenario: OverviewScenario) => patch({ overviewScenario }),
      setAuthScenario: (authScenario: AuthScenario) => patch({ authScenario }),
      setPanelOpen: (isPanelOpen: boolean) => patch({ isPanelOpen }),
      resetAll: () => setState({ ...DEFAULT_STATE, isPanelOpen: true }),
    }),
    [state, patch],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

function useDemo(): DemoState & DemoActions {
  const context = useContext(DemoContext);
  if (context === null) throw new Error("useDemo harus dipakai di dalam DemoProvider");
  return context;
}

export { DemoProvider, useDemo };
export type { DensitySetting, MotionSetting, OverviewScenario, ThemeSetting };
