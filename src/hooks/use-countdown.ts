import { useCallback, useEffect, useRef, useState } from "react";

const TICK_MS = 250;

// Hitung mundur berbasis jam dinding, jadi tetap akurat saat tab sempat tertidur
function useCountdown() {
  const [remainingSeconds, setRemaining] = useState(0);
  const endRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    endRef.current = null;
  }, []);

  const stop = useCallback(() => {
    clear();
    setRemaining(0);
  }, [clear]);

  const start = useCallback(
    (seconds: number) => {
      clear();
      if (seconds <= 0) {
        setRemaining(0);
        return;
      }
      endRef.current = Date.now() + seconds * 1000;
      setRemaining(seconds);
      timerRef.current = window.setInterval(() => {
        const end = endRef.current;
        if (end === null) return;
        const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        setRemaining(left);
        if (left === 0) clear();
      }, TICK_MS);
    },
    [clear],
  );

  useEffect(() => clear, [clear]);

  return { remainingSeconds, start, stop };
}

export { useCountdown };
