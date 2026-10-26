import { useEffect, useRef, useState } from "react";
import { CircleCheck, LifeBuoy, LoaderCircle, Mail } from "lucide-react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthNotice } from "@/components/auth/auth-notice";
import { OtpField } from "@/components/auth/otp-field";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/use-countdown";
import { formatClock } from "@/lib/auth-paths";
import { CODE_LENGTH } from "@/mock/accounts";
import { AuthError, requestCode, verifyCode, wait } from "@/mock/auth-service";
import type { AuthFailure } from "@/mock/auth-service";
import type { CodeRouteState } from "@/pages/login-page";
import { useAuth } from "@/state/auth-context";
import { useDemo } from "@/state/demo-context";

// Proses verifikasi dibuat terlihat walau server tiruan cepat, supaya terasa sungguhan dan tidak berkedip
const VERIFY_MIN_MS = 800;
const SUCCESS_HOLD_MS = 900;

type Phase = "idle" | "verifying" | "success";

function isRouteState(value: unknown): value is CodeRouteState {
  if (typeof value !== "object" || value === null) return false;
  const state = value as Partial<CodeRouteState>;
  return typeof state.email === "string" && typeof state.cooldownSeconds === "number" && typeof state.expiresInSeconds === "number";
}

function HelpPanel() {
  return (
    <details className="group rounded-md border border-hairline px-3 py-2.5 text-body">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-charcoal">
        <LifeBuoy className="size-4" aria-hidden="true" />
        Tidak menerima kode?
      </summary>
      <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-mute">
        <li>Periksa folder spam atau promosi.</li>
        <li>Kode bisa tiba dalam beberapa menit. Tunggu sebelum meminta ulang.</li>
        <li>Pastikan email di atas benar. Pakai “Ganti email” bila salah ketik.</li>
        <li>Masih belum ada? Hubungi admin Tracer untuk memastikan email Anda sudah terdaftar.</li>
      </ul>
    </details>
  );
}

function failureText(failure: AuthFailure): string {
  switch (failure.kind) {
    case "wrong":
      return `Kode tidak cocok. Sisa ${failure.attemptsLeft} percobaan.`;
    case "expired":
      return "Kode sudah kedaluwarsa. Kirim kode baru untuk melanjutkan.";
    case "locked":
      return "Terlalu banyak percobaan salah. Kirim kode baru untuk mencoba lagi.";
    case "rate":
      return `Terlalu banyak permintaan kode. Coba lagi dalam ${formatClock(failure.retryAfterSeconds)}.`;
    case "network":
      return "Tidak bisa terhubung ke server. Periksa koneksi Anda lalu coba lagi.";
  }
}

function LoginCodePage() {
  const location = useLocation();
  const routeState: unknown = location.state;
  if (!isRouteState(routeState)) return <Navigate to={{ pathname: "/login", search: location.search }} replace />;
  return <CodeStep initial={routeState} search={location.search} />;
}

function CodeStep({ initial, search }: { initial: CodeRouteState; search: string }) {
  const { authScenario } = useDemo();
  const { signIn } = useAuth();
  const [params] = useSearchParams();
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [failure, setFailure] = useState<AuthFailure | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [isResending, setResending] = useState(false);
  const attemptRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const cooldown = useCountdown();
  const validity = useCountdown();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    cooldown.start(initial.cooldownSeconds);
    validity.start(initial.expiresInSeconds);
    hasStartedRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    return () => controller.abort();
    // Hanya saat layar dibuka; hitung mundur selanjutnya dimulai oleh kirim ulang
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kode yang habis waktunya ditandai kedaluwarsa tanpa menunggu pengguna mencoba
  const isTimedOut = hasStartedRef.current && validity.remainingSeconds === 0 && failure?.kind !== "expired";
  const effectiveFailure: AuthFailure | null = isTimedOut ? { kind: "expired" } : failure;
  const isFieldLocked = effectiveFailure?.kind === "expired" || effectiveFailure?.kind === "locked";
  const isVerifying = phase === "verifying";
  const noteId = "kode-catatan";

  const handleComplete = async (value: string) => {
    if (isVerifying || isFieldLocked) return;
    setPhase("verifying");
    setFailure(null);
    attemptRef.current += 1;
    const signal = abortRef.current?.signal;
    try {
      await Promise.all([verifyCode(authScenario, value, attemptRef.current, signal), wait(VERIFY_MIN_MS, signal)]);
      setPhase("success");
      validity.stop();
      cooldown.stop();
      await wait(SUCCESS_HOLD_MS, signal);
      signIn(initial.email);
    } catch (error) {
      if (error instanceof DOMException) return;
      setPhase("idle");
      setCode("");
      if (error instanceof AuthError) setFailure(error.failure);
    }
  };

  const handleResend = async () => {
    if (isResending || cooldown.remainingSeconds > 0) return;
    setResending(true);
    setFailure(null);
    const signal = abortRef.current?.signal;
    try {
      const result = await requestCode(authScenario, signal);
      attemptRef.current = 0;
      setCode("");
      cooldown.start(result.cooldownSeconds);
      validity.start(result.expiresInSeconds);
      setAnnouncement("Kode baru sudah dikirim.");
    } catch (error) {
      if (error instanceof DOMException) return;
      if (error instanceof AuthError) {
        setFailure(error.failure);
        if (error.failure.kind === "rate") cooldown.start(error.failure.retryAfterSeconds);
      }
    } finally {
      setResending(false);
    }
  };

  if (phase === "success") {
    return (
      <AuthLayout>
        <div role="status" className="flex flex-col items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-success-bg text-success-text">
            <CircleCheck className="size-5" aria-hidden="true" />
          </span>
          <h1 className="text-page-title font-semibold text-ink">Berhasil masuk</h1>
          <p className="text-body text-mute">Menyiapkan ruang kerja Anda…</p>
          <div className="h-1 w-full overflow-hidden rounded-xs bg-surface-active">
            <div className="animate-skeleton h-full w-1/3 rounded-xs bg-primary" />
          </div>
        </div>
      </AuthLayout>
    );
  }

  const canResend = cooldown.remainingSeconds === 0 && !isResending && !isVerifying;
  const showResendProminent = isFieldLocked;

  return (
    <AuthLayout>
      <header className="flex flex-col gap-2">
        <h1 className="text-page-title font-semibold text-ink">Masukkan kode</h1>
        <p className="flex flex-wrap items-center gap-x-1.5 text-body text-mute">
          <Mail className="size-4 shrink-0" aria-hidden="true" />
          Dikirim ke <span className="break-all font-mono text-ink">{initial.email}</span>
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <OtpField
          length={CODE_LENGTH}
          label="Kode 6 digit"
          value={code}
          onChange={setCode}
          onComplete={handleComplete}
          isDisabled={isVerifying || isFieldLocked}
          hasError={effectiveFailure !== null && effectiveFailure.kind !== "network"}
          describedBy={noteId}
        />

        <div id={noteId} className="flex min-h-5 flex-col gap-2 text-caption">
          {isVerifying ? (
            <>
              <p className="flex items-center gap-2 text-mute">
                <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                Memeriksa kode…
              </p>
              <div className="h-1 overflow-hidden rounded-xs bg-surface-active">
                <div className="animate-skeleton h-full w-1/3 rounded-xs bg-primary" />
              </div>
            </>
          ) : effectiveFailure !== null ? null : (
            <p className="text-mute">
              Kode berlaku <span className="font-mono text-ink">{formatClock(validity.remainingSeconds)}</span> lagi.
              Masuk otomatis saat digit ke-6 terisi.
            </p>
          )}
        </div>

        {effectiveFailure === null ? null : (
          <AuthNotice tone={effectiveFailure.kind === "network" ? "warning" : "danger"}>
            {failureText(effectiveFailure)}
          </AuthNotice>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant={showResendProminent ? "primary" : "secondary"}
          disabled={!canResend}
          onClick={handleResend}
          aria-busy={isResending}
        >
          {isResending ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Mengirim kode…
            </>
          ) : cooldown.remainingSeconds > 0 ? (
            `Kirim ulang kode (${formatClock(cooldown.remainingSeconds)})`
          ) : (
            "Kirim ulang kode"
          )}
        </Button>
        <Link
          to={{ pathname: "/login", search }}
          className="self-start rounded-sm py-1 text-body text-charcoal underline-offset-2 hover:text-ink hover:underline"
        >
          Ganti email
        </Link>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <HelpPanel />
      {params.get("next") === null ? null : (
        <p className="text-caption text-mute">Setelah masuk, Anda dibawa kembali ke halaman sebelumnya.</p>
      )}
    </AuthLayout>
  );
}

export { LoginCodePage };
