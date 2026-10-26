import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { TICK_MS, advanceVisitors, initialVisitors } from "@/mock/live";
import type { LiveVisitor } from "@/mock/live";
import { useActiveProject } from "@/state/use-active-project";
import { useDemo } from "@/state/demo-context";

type LiveConnection = "terhubung" | "terputus";

type LiveValue = {
  visitors: LiveVisitor[];
  activeCount: number;
  connection: LiveConnection;
  isPaused: boolean;
  setPaused: (value: boolean) => void;
  // Jam yang berdetak tiap detik, supaya durasi di daftar ikut berjalan
  now: number;
  // Waktu pembaruan data terakhir dari "server"
  updatedAt: number;
};

const LiveContext = createContext<LiveValue | null>(null);

type LiveState = { key: string; visitors: LiveVisitor[]; updatedAt: number };

function LiveProvider({ children }: { children: ReactNode }) {
  const { project, installation } = useActiveProject();
  const { liveScenario } = useDemo();
  const projectId = project?.id ?? null;
  const isLiveAvailable = projectId !== null && installation === "detected";
  const key = `${projectId ?? "-"}:${liveScenario}:${isLiveAvailable ? "on" : "off"}`;

  const [state, setState] = useState<LiveState>(() => {
    const start = Date.now();
    return {
      key,
      visitors: isLiveAvailable && projectId !== null ? initialVisitors(projectId, liveScenario, start) : [],
      updatedAt: start,
    };
  });
  const [now, setNow] = useState(() => Date.now());
  const [isPaused, setPaused] = useState(false);
  const serialRef = useRef(0);

  // Ganti project atau skenario memulai ulang daftar dari awal
  if (state.key !== key) {
    const start = Date.now();
    serialRef.current = 0;
    setState({
      key,
      visitors: isLiveAvailable && projectId !== null ? initialVisitors(projectId, liveScenario, start) : [],
      updatedAt: start,
    });
  }

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const connection: LiveConnection = liveScenario === "terputus" ? "terputus" : "terhubung";
  const isTicking = isLiveAvailable && connection === "terhubung" && liveScenario !== "kosong" && !isPaused;

  useEffect(() => {
    if (!isTicking || projectId === null) return;
    const timer = window.setInterval(() => {
      const at = Date.now();
      setState((current) => {
        const next = advanceVisitors(current.visitors, projectId, liveScenario, at, serialRef.current);
        serialRef.current = next.serial;
        return { ...current, visitors: next.visitors, updatedAt: at };
      });
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [isTicking, projectId, liveScenario]);

  const value = useMemo<LiveValue>(
    () => ({
      visitors: state.visitors,
      activeCount: state.visitors.filter((visitor) => visitor.leavingAt === null).length,
      connection,
      isPaused,
      setPaused,
      now,
      updatedAt: state.updatedAt,
    }),
    [state, connection, isPaused, now],
  );

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

function useLive(): LiveValue {
  const context = useContext(LiveContext);
  if (context === null) throw new Error("useLive harus dipakai di dalam LiveProvider");
  return context;
}

export { LiveProvider, useLive };
export type { LiveConnection };
