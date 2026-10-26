import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import { parseQuery, serializeQuery, startOfDay, toIsoDate } from "@/lib/dashboard-query";
import type { DashboardFilters, DashboardQuery, FilterKey, PeriodPreset } from "@/mock/types";

type DashboardQueryApi = {
  query: DashboardQuery;
  // Query string siap pakai untuk tautan ke halaman lain, tanpa tanda tanya
  queryString: string;
  hasFilters: boolean;
  setFilter: (key: FilterKey, value: string | null) => void;
  toggleFilter: (key: FilterKey, value: string) => void;
  clearFilters: () => void;
  setPreset: (preset: Exclude<PeriodPreset, "custom">) => void;
  setCustomPeriod: (from: Date, to: Date) => void;
  setCompare: (value: boolean) => void;
  setOnlyProblems: (value: boolean) => void;
  applyQueryString: (queryString: string) => void;
};

// Seluruh keadaan filter hidup di URL: bisa dibagikan, dan tombol kembali tetap masuk akal
function useDashboardQuery(): DashboardQueryApi {
  const [params, setParams] = useSearchParams();
  const paramsText = params.toString();

  const query = useMemo(() => parseQuery(new URLSearchParams(paramsText), startOfDay(new Date())), [paramsText]);

  const commit = useCallback(
    (next: DashboardQuery) => setParams(serializeQuery(next), { replace: true }),
    [setParams],
  );

  const withFilters = useCallback(
    (filters: DashboardFilters): DashboardQuery => ({ ...query, filters }),
    [query],
  );

  const setFilter = useCallback(
    (key: FilterKey, value: string | null) => {
      const { [key]: _removed, ...rest } = query.filters;
      commit(withFilters(value === null ? rest : { ...rest, [key]: value }));
    },
    [query.filters, commit, withFilters],
  );

  const toggleFilter = useCallback(
    (key: FilterKey, value: string) => setFilter(key, query.filters[key] === value ? null : value),
    [query.filters, setFilter],
  );

  const setPreset = useCallback(
    (preset: Exclude<PeriodPreset, "custom">) => {
      const next = parseQuery(new URLSearchParams({ range: preset }), startOfDay(new Date()));
      commit({ ...query, period: next.period });
    },
    [query, commit],
  );

  const setCustomPeriod = useCallback(
    (from: Date, to: Date) => {
      const merged = serializeQuery(query);
      merged.delete("range");
      merged.set("from", toIsoDate(from));
      merged.set("to", toIsoDate(to));
      commit(parseQuery(merged, startOfDay(new Date())));
    },
    [query, commit],
  );

  return {
    query,
    queryString: serializeQuery(query).toString(),
    hasFilters: Object.keys(query.filters).length > 0,
    setFilter,
    toggleFilter,
    clearFilters: () => commit(withFilters({})),
    setPreset,
    setCustomPeriod,
    setCompare: (value) => commit({ ...query, compare: value }),
    setOnlyProblems: (value) => commit({ ...query, onlyProblems: value }),
    applyQueryString: (queryString) => setParams(new URLSearchParams(queryString), { replace: true }),
  };
}

export { useDashboardQuery };
export type { DashboardQueryApi };
