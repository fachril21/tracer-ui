import { CODE_LENGTH, DEMO_CODE } from "@/mock/accounts";

// Skenario hasil dari "server" tiruan, dipilih lewat panel demo
type AuthScenario = "berhasil" | "kode-salah" | "kedaluwarsa" | "terlalu-banyak" | "batas-kirim" | "galat-jaringan";

const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30;
const CODE_VALID_SECONDS = 600;
// Kode dibuat cepat habis di skenario kedaluwarsa supaya hitung mundurnya bisa disaksikan
const SHORT_VALID_SECONDS = 15;
const RATE_LIMIT_SECONDS = 45;
const LATENCY_MS = 700;

type RequestOutcome = { cooldownSeconds: number; expiresInSeconds: number };

type AuthFailure =
  | { kind: "network" }
  | { kind: "rate"; retryAfterSeconds: number }
  | { kind: "wrong"; attemptsLeft: number }
  | { kind: "expired" }
  | { kind: "locked" };

class AuthError extends Error {
  readonly failure: AuthFailure;

  constructor(failure: AuthFailure) {
    super(failure.kind);
    this.failure = failure;
  }
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(new DOMException("Dibatalkan", "AbortError"));
    });
  });
}

async function requestCode(scenario: AuthScenario, signal?: AbortSignal): Promise<RequestOutcome> {
  await wait(LATENCY_MS, signal);
  if (scenario === "galat-jaringan") throw new AuthError({ kind: "network" });
  if (scenario === "batas-kirim") throw new AuthError({ kind: "rate", retryAfterSeconds: RATE_LIMIT_SECONDS });
  return {
    cooldownSeconds: COOLDOWN_SECONDS,
    expiresInSeconds: scenario === "kedaluwarsa" ? SHORT_VALID_SECONDS : CODE_VALID_SECONDS,
  };
}

// attempt = percobaan ke berapa pada kode ini, dihitung oleh pemanggil
async function verifyCode(
  scenario: AuthScenario,
  code: string,
  attempt: number,
  signal?: AbortSignal,
): Promise<void> {
  await wait(LATENCY_MS, signal);
  if (scenario === "galat-jaringan") throw new AuthError({ kind: "network" });
  if (scenario === "terlalu-banyak") throw new AuthError({ kind: "locked" });
  if (scenario === "kedaluwarsa") throw new AuthError({ kind: "expired" });
  if (scenario === "kode-salah" || code !== DEMO_CODE || code.length !== CODE_LENGTH) {
    if (attempt >= MAX_ATTEMPTS) throw new AuthError({ kind: "locked" });
    throw new AuthError({ kind: "wrong", attemptsLeft: MAX_ATTEMPTS - attempt });
  }
}

export { AuthError, MAX_ATTEMPTS, requestCode, verifyCode, wait };
export type { AuthFailure, AuthScenario, RequestOutcome };
