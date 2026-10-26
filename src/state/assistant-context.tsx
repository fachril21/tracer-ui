import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  DAILY_LIMIT,
  answerFeedback,
  answerFree,
  answerFunnel,
  answerSession,
} from "@/mock/assistant";
import type { Answer, AssistantRequest } from "@/mock/assistant";
import { buildSessionPool } from "@/mock/sessions";
import { useDemo } from "@/state/demo-context";
import { useActiveProject } from "@/state/use-active-project";

// Jeda singkat supaya proses terlihat, bukan jawaban yang muncul seketika
const RESPONSE_DELAY_MS = 900;

type AssistantStatus = "memuat" | "selesai" | "galat" | "batas";

type AssistantTurn = {
  id: number;
  label: string;
  request: AssistantRequest;
  status: AssistantStatus;
  answer: Answer | null;
};

type AssistantValue = {
  isOpen: boolean;
  turns: AssistantTurn[];
  usedToday: number;
  setOpen: (value: boolean) => void;
  ask: (request: AssistantRequest, label: string) => void;
  retry: (id: number) => void;
  clear: () => void;
};

const AssistantContext = createContext<AssistantValue | null>(null);

function AssistantProvider({ children }: { children: ReactNode }) {
  const { project } = useActiveProject();
  const { aiScenario } = useDemo();
  const [isOpen, setOpen] = useState(false);
  const [turns, setTurns] = useState<AssistantTurn[]>([]);
  const [usedToday, setUsedToday] = useState(3);
  const serialRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const projectId = project?.id ?? "";

  useEffect(
    () => () => {
      for (const timer of timersRef.current) window.clearTimeout(timer);
    },
    [],
  );

  const compute = useCallback(
    (request: AssistantRequest): Answer => {
      const now = new Date();
      switch (request.kind) {
        case "session": {
          const session = buildSessionPool(projectId, now).find((item) => item.id === request.sessionId);
          return session === undefined
            ? { paragraphs: ["Sesi ini tidak ditemukan atau sudah melewati masa simpan."], sources: [], action: null }
            : answerSession(projectId, session);
        }
        case "funnel":
          return answerFunnel(projectId, request.funnel, now);
        case "feedback":
          return answerFeedback(projectId, now);
        case "free":
          return answerFree(projectId, request.text, now);
      }
    },
    [projectId],
  );

  const resolve = useCallback(
    (id: number, request: AssistantRequest) => {
      const timer = window.setTimeout(() => {
        const status: AssistantStatus = aiScenario === "galat" ? "galat" : aiScenario === "batas" ? "batas" : "selesai";
        const answer = status === "selesai" ? compute(request) : null;
        setTurns((current) => current.map((turn) => (turn.id === id ? { ...turn, status, answer } : turn)));
        if (status === "selesai") setUsedToday((count) => count + 1);
      }, RESPONSE_DELAY_MS);
      timersRef.current.push(timer);
    },
    [aiScenario, compute],
  );

  const ask = useCallback(
    (request: AssistantRequest, label: string) => {
      serialRef.current += 1;
      const id = serialRef.current;
      setOpen(true);
      setTurns((current) => [...current, { id, label, request, status: "memuat", answer: null }]);
      resolve(id, request);
    },
    [resolve],
  );

  const retry = useCallback(
    (id: number) => {
      const target = turns.find((turn) => turn.id === id);
      if (target === undefined) return;
      setTurns((current) => current.map((turn) => (turn.id === id ? { ...turn, status: "memuat" } : turn)));
      resolve(id, target.request);
    },
    [turns, resolve],
  );

  const clear = useCallback(() => setTurns([]), []);

  const value = useMemo(
    () => ({ isOpen, turns, usedToday, setOpen, ask, retry, clear }),
    [isOpen, turns, usedToday, ask, retry, clear],
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

function useAssistant(): AssistantValue {
  const context = useContext(AssistantContext);
  if (context === null) throw new Error("useAssistant harus dipakai di dalam AssistantProvider");
  return context;
}

export { AssistantProvider, DAILY_LIMIT, useAssistant };
export type { AssistantStatus, AssistantTurn };
