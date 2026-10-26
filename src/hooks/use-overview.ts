import { useCallback, useEffect, useMemo, useState } from "react";
import { MIN_VISIBLE_SESSIONS, buildOverview } from "@/mock/data";
import type { OverviewData } from "@/mock/data";
import type { DashboardQuery } from "@/mock/types";
import { useDemo } from "@/state/demo-context";
import { useActiveProject } from "@/state/use-active-project";

// Jeda muat awal tiruan: cukup lama agar skeleton terlihat, cukup singkat agar tidak menghalangi
const LOAD_DELAY_MS = 600;

type OverviewStatus = "loading" | "ready" | "empty" | "no-match" | "error" | "waiting";

type OverviewState = {
  status: OverviewStatus;
  data: OverviewData | null;
  now: Date;
  errorMessage: string;
  reload: () => void;
};

const ERROR_MESSAGE = "Layanan analisis sedang padat. Coba lagi dalam beberapa saat.";

function useOverview(projectId: string, query: DashboardQuery): OverviewState {
  const { overviewScenario } = useDemo();
  const { installation } = useActiveProject();
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [now] = useState(() => new Date());

  // Ganti filter atau rentang tidak memicu muat ulang: aksi sering harus instan.
  // Ganti project, skenario, atau muat ulang eksplisit menampilkan skeleton.
  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), LOAD_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [projectId, reloadKey, overviewScenario]);

  const data = useMemo(() => buildOverview(projectId, query, now), [projectId, query, now]);
  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const hasFilters = Object.keys(query.filters).length > 0;
  const sessionCount = data.metrics[0]?.value ?? 0;

  let status: OverviewStatus = "ready";
  if (overviewScenario === "memuat" || isLoading) status = "loading";
  else if (overviewScenario === "galat") status = "error";
  else if (installation === "waiting") status = "waiting";
  else if (overviewScenario === "kosong") status = "empty";
  else if (hasFilters && sessionCount < MIN_VISIBLE_SESSIONS) status = "no-match";

  return {
    status,
    data: status === "ready" ? data : null,
    now,
    errorMessage: ERROR_MESSAGE,
    reload,
  };
}

export { useOverview };
export type { OverviewStatus };
