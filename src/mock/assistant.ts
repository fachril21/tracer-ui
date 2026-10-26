import { buildFeedback, summarizeFeedback } from "./feedback";
import { EVENT_LABEL, computeFunnel, droppedSessions, seedFunnels, stepLabel } from "./funnels";
import { buildSessionPool } from "./sessions";
import type { Funnel } from "./funnels";
import type { MockSession } from "./types";
import { formatClock, formatDuration } from "@/lib/format";

type AssistantRequest =
  | { kind: "session"; sessionId: string }
  | { kind: "funnel"; funnel: Funnel }
  | { kind: "feedback" }
  | { kind: "free"; text: string };

type AnswerSource = { label: string; to: string };

type Answer = {
  // Paragraf jawaban, tiap elemen satu paragraf
  paragraphs: string[];
  sources: AnswerSource[];
  // Tindakan yang hanya berjalan setelah diklik pengguna
  action: AnswerSource | null;
};

const DAILY_LIMIT = 20;
const FUNNEL_DAYS = 30;
const PERCENT_SCALE = 10;

const SUGGESTIONS: { label: string; text: string }[] = [
  { label: "Rangkum masukan pengunjung", text: "Rangkum masukan pengunjung" },
  { label: "Sesi mana yang paling bermasalah?", text: "Sesi mana yang paling bermasalah?" },
  { label: "Di mana pengunjung berhenti?", text: "Di mana pengunjung berhenti di funnel?" },
];

function percent(value: number): string {
  return `${(Math.round(value * PERCENT_SCALE) / PERCENT_SCALE).toString().replace(".", ",")}%`;
}

function answerSession(projectId: string, session: MockSession): Answer {
  const events = (Object.keys(session.smartEvents) as (keyof MockSession["smartEvents"])[])
    .filter((kind) => session.smartEvents[kind] > 0)
    .map((kind) => `${session.smartEvents[kind]} ${EVENT_LABEL[kind].toLowerCase()}`);
  const signals = session.trace.filter((mark) => mark.kind !== "page");
  const first = signals[0];
  const firstAt = first === undefined ? 0 : Math.round(first.at * session.durationSeconds);

  const opening = `Sesi ini berlangsung ${formatDuration(session.durationSeconds)} di ${session.device.toLowerCase()} (${session.browser}), masuk dari ${session.source.toLowerCase()} lewat ${session.entryPage}.`;
  const body =
    events.length === 0
      ? "Tidak ada sinyal masalah yang terekam, pengunjung menjelajah dengan lancar."
      : `Terekam ${events.join(", ")}. Sinyal pertama muncul sekitar menit ${formatClock(firstAt)}.`;
  const gap = session.integrity === "has_gap" ? "Rekaman punya celah, jadi sebagian kejadian mungkin tidak terlihat." : null;

  return {
    paragraphs: gap === null ? [opening, body] : [opening, body, gap],
    sources: [
      {
        label: `Lompat ke ${formatClock(firstAt)} di ${session.id}`,
        to: `/p/${projectId}/sessions/${session.id}?t=${firstAt}`,
      },
    ],
    action: null,
  };
}

function answerFunnel(projectId: string, funnel: Funnel, now: Date): Answer {
  const all = computeFunnel(projectId, funnel, FUNNEL_DAYS, now);
  const index = all.biggestDropIndex;
  const step = index === null ? undefined : all.steps[index];
  if (index === null || step === undefined) {
    return { paragraphs: ["Funnel ini belum punya cukup langkah untuk dibandingkan."], sources: [], action: null };
  }
  const mobile = computeFunnel(projectId, funnel, FUNNEL_DAYS, now, "Mobile").steps[index];
  const desktop = computeFunnel(projectId, funnel, FUNNEL_DAYS, now, "Desktop").steps[index];
  const lost = 100 - step.rateFromPrevious;
  const samples = droppedSessions(projectId, funnel, index, FUNNEL_DAYS, now).slice(0, 2);
  const base = `/p/${projectId}/funnel/${funnel.id}`;

  const paragraphs = [
    `Dalam ${FUNNEL_DAYS} hari terakhir, kehilangan terbesar ada di langkah ${index + 1} (${stepLabel(step.step)}): ${percent(lost)} pengunjung dari langkah sebelumnya berhenti di sini, sekitar ${step.dropped} sesi.`,
  ];
  if (mobile !== undefined && desktop !== undefined) {
    paragraphs.push(
      `Ponsel lolos ${percent(mobile.rateFromPrevious)} sedangkan desktop ${percent(desktop.rateFromPrevious)} di langkah yang sama. Ini angka perbandingan, bukan penyebab pasti.`,
    );
  }
  return {
    paragraphs,
    sources: [
      { label: `Funnel ${FUNNEL_DAYS} hari`, to: `${base}?hari=${FUNNEL_DAYS}` },
      ...samples.map((session) => ({ label: `Sesi ${session.id}`, to: `/p/${projectId}/sessions/${session.id}` })),
    ],
    action: { label: "Bandingkan ponsel dan desktop", to: `${base}?bandingkan=perangkat` },
  };
}

function answerFeedback(projectId: string, now: Date): Answer {
  const items = buildFeedback(projectId, now);
  const summary = summarizeFeedback(items);
  const problems = items.filter((item) => item.kind === "masalah");
  const pageCount = new Map<string, number>();
  for (const item of problems) pageCount.set(item.page, (pageCount.get(item.page) ?? 0) + 1);
  const topPage = [...pageCount.entries()].sort((a, b) => b[1] - a[1])[0];
  const withSession = problems.filter((item) => item.sessionId !== null).slice(0, 2);

  const paragraphs = [
    `Dari ${summary.total} masukan, nilai rata-rata ${summary.average.toFixed(1).replace(".", ",")} dari 5. ${problems.length} masukan (${percent((problems.length / Math.max(1, summary.total)) * 100)}) berupa masalah, dan ${summary.unread} belum dibaca.`,
  ];
  if (topPage !== undefined) {
    paragraphs.push(`Masalah paling sering disebut terjadi di ${topPage[0]} (${topPage[1]} masukan), terutama soal tombol dan pembayaran.`);
  }
  return {
    paragraphs,
    sources: withSession.map((item) => ({
      label: `Sesi ${item.sessionId ?? ""}`,
      to: `/p/${projectId}/sessions/${item.sessionId ?? ""}`,
    })),
    action: { label: "Terapkan filter ini", to: `/p/${projectId}/feedback?jenis=masalah&status=baru` },
  };
}

function answerFree(projectId: string, text: string, now: Date): Answer {
  const lowered = text.toLowerCase();
  if (lowered.includes("masukan") || lowered.includes("feedback")) return answerFeedback(projectId, now);
  if (lowered.includes("funnel") || lowered.includes("berhenti")) {
    const funnel = seedFunnels()[0];
    if (funnel !== undefined) return answerFunnel(projectId, funnel, now);
  }
  if (lowered.includes("sesi") || lowered.includes("masalah")) {
    const worst = [...buildSessionPool(projectId, now)].sort((a, b) => b.problemScore - a.problemScore)[0];
    if (worst !== undefined) return answerSession(projectId, worst);
  }
  return {
    paragraphs: [
      "Saya bisa meringkas satu sesi, menjelaskan penurunan di funnel, dan merangkum masukan pengunjung. Pilih salah satu di bawah, atau tuliskan dengan kata sesi, funnel, atau masukan.",
    ],
    sources: [],
    action: null,
  };
}

export type { Answer, AnswerSource, AssistantRequest };
export { DAILY_LIMIT, SUGGESTIONS, answerFeedback, answerFree, answerFunnel, answerSession };
