import { useCallback, useEffect, useRef, useState } from "react";

type PlaybackSpeed = 1 | 2 | 4 | 8;

const SPEEDS: PlaybackSpeed[] = [1, 2, 4, 8];
const DEFAULT_SPEED: PlaybackSpeed = 4;

type Playback = {
  timeMs: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  toggle: () => void;
  seek: (ms: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
};

// Pemutar tiruan: waktu maju mengikuti frame animasi dikali kecepatan, berhenti di ujung sesi
function usePlayback(durationMs: number): Playback {
  const [timeMs, setTimeMs] = useState(0);
  const [isPlaying, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(DEFAULT_SPEED);
  const lastFrame = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      lastFrame.current = null;
      return;
    }
    let handle = 0;
    const tick = (now: number) => {
      const previous = lastFrame.current ?? now;
      lastFrame.current = now;
      const delta = (now - previous) * speed;
      let reachedEnd = false;
      setTimeMs((current) => {
        const next = current + delta;
        if (next >= durationMs) {
          reachedEnd = true;
          return durationMs;
        }
        return next;
      });
      if (reachedEnd) setPlaying(false);
      else handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [isPlaying, speed, durationMs]);

  const toggle = useCallback(() => {
    // Menekan putar di ujung sesi memulai ulang dari awal
    if (!isPlaying && timeMs >= durationMs) setTimeMs(0);
    setPlaying(!isPlaying);
  }, [isPlaying, timeMs, durationMs]);

  const seek = useCallback(
    (ms: number) => setTimeMs(Math.min(Math.max(ms, 0), durationMs)),
    [durationMs],
  );

  return { timeMs, isPlaying, speed, toggle, seek, setSpeed };
}

export { SPEEDS, usePlayback };
export type { Playback, PlaybackSpeed };
