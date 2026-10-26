import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthNotice } from "@/components/auth/auth-notice";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";
import { useCountdown } from "@/hooks/use-countdown";
import { formatClock } from "@/lib/auth-paths";
import { IS_DEMO_ENABLED } from "@/lib/demo-flag";
import { SAMPLE_ACCOUNTS } from "@/mock/accounts";
import { AuthError, requestCode } from "@/mock/auth-service";
import type { AuthFailure } from "@/mock/auth-service";
import { useDemo } from "@/state/demo-context";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CodeRouteState = { email: string; cooldownSeconds: number; expiresInSeconds: number };

function ExitNotice({ reason }: { reason: string | null }) {
  if (reason === "berakhir") {
    return <AuthNotice tone="warning">Sesi Anda berakhir karena tidak aktif. Masuk lagi untuk melanjutkan.</AuthNotice>;
  }
  if (reason === "keluar") return <AuthNotice tone="info">Anda sudah keluar dari Tracer.</AuthNotice>;
  return null;
}

function failureMessage(failure: AuthFailure): string | null {
  if (failure.kind === "network") return "Tidak bisa terhubung ke server. Periksa koneksi Anda lalu coba lagi.";
  return null;
}

function LoginPage() {
  const { authScenario } = useDemo();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const [isBusy, setBusy] = useState(false);
  const rate = useCountdown();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isBusy || rate.remainingSeconds > 0) return;
    const value = email.trim().toLowerCase();
    if (value === "") {
      setFieldError("Isi alamat email Anda.");
      return;
    }
    if (!EMAIL_PATTERN.test(value)) {
      setFieldError("Alamat email belum lengkap, misalnya nama@perusahaan.id.");
      return;
    }
    setFieldError(null);
    setFailure(null);
    setBusy(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const result = await requestCode(authScenario, controller.signal);
      const state: CodeRouteState = {
        email: value,
        cooldownSeconds: result.cooldownSeconds,
        expiresInSeconds: result.expiresInSeconds,
      };
      navigate({ pathname: "/login/code", search: location.search }, { state });
    } catch (error) {
      if (error instanceof DOMException) return;
      if (error instanceof AuthError) {
        setFailure(error.failure);
        if (error.failure.kind === "rate") rate.start(error.failure.retryAfterSeconds);
      }
      setBusy(false);
    }
  };

  const isRateLimited = rate.remainingSeconds > 0;
  const networkMessage = failure === null ? null : failureMessage(failure);

  return (
    <AuthLayout>
      <header className="flex flex-col gap-2">
        <h1 className="text-page-title font-semibold text-ink">Masuk ke Tracer</h1>
        <p className="text-body text-mute">
          Kami kirim kode 6 digit ke email Anda. Tidak perlu kata sandi.
        </p>
      </header>

      <ExitNotice reason={params.get("alasan")} />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          name="email"
          value={email}
          autoFocus
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          placeholder="nama@perusahaan.id"
          error={fieldError}
          hint={fieldError === null ? "Gunakan email yang didaftarkan admin Tracer." : undefined}
          disabled={isBusy}
          onChange={(event) => {
            setEmail(event.target.value);
            if (fieldError !== null) setFieldError(null);
          }}
        />

        {networkMessage === null ? null : (
          <AuthNotice tone="danger">{networkMessage}</AuthNotice>
        )}
        {failure?.kind === "rate" ? (
          <AuthNotice tone="warning">
            Terlalu banyak permintaan kode. Coba lagi dalam{" "}
            <span className="font-mono">{formatClock(rate.remainingSeconds)}</span>.
          </AuthNotice>
        ) : null}

        <Button type="submit" variant="primary" size="lg" disabled={isBusy || isRateLimited} aria-busy={isBusy}>
          {isBusy ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Mengirim kode…
            </>
          ) : isRateLimited ? (
            `Coba lagi dalam ${formatClock(rate.remainingSeconds)}`
          ) : (
            <>
              Kirim kode
              <ArrowRight aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      {IS_DEMO_ENABLED ? (
        <section aria-label="Akun contoh" className="flex flex-col gap-2 border-t border-hairline pt-4">
          <p className="font-mono text-label uppercase tracking-[0.06em] text-stone">Akun contoh (demo)</p>
          <ul className="flex flex-col gap-1.5">
            {SAMPLE_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setFieldError(null);
                  }}
                  className="flex w-full flex-col rounded-md px-2 py-1.5 text-left hover:bg-surface-hover"
                >
                  <span className="text-body text-ink">{account.label}</span>
                  <span className="font-mono text-caption text-mute">{account.email}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-caption text-mute">
            Kode demo: <span className="font-mono text-ink">123456</span>
          </p>
        </section>
      ) : null}
    </AuthLayout>
  );
}

export { LoginPage };
export type { CodeRouteState };
