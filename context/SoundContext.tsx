"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { audioEngine } from "../lib/audioEngine";

// ─── Context shape ─────────────────────────────────────────────────────────

type SoundContextValue = {
  playCorrect: () => void;
  playWrong: () => void;
  playGameOver: () => void;
  playTimeWarning: () => void;
  playStageUp: () => void;
  playSkip: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────

export function SoundProvider({ children }: { children: ReactNode }) {
  // Track last hovered interactive element to avoid rapid-fire hover sounds
  const lastHoveredRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    // ── Hover sound (mouseover on buttons / links / role="button") ──────────
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        'button, a, [role="button"], input[type="submit"]'
      );
      if (interactive && interactive !== lastHoveredRef.current) {
        lastHoveredRef.current = interactive;
        audioEngine.playHover();
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        'button, a, [role="button"], input[type="submit"]'
      );
      if (interactive && interactive === lastHoveredRef.current) {
        lastHoveredRef.current = null;
      }
    };

    // ── Click sound (all buttons / links) ───────────────────────────────────
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'button, a, [role="button"], input[type="submit"]'
        )
      ) {
        audioEngine.playClick();
      }
    };

    // ── Background music starts on first user interaction ───────────────────
    const startMusic = async () => {
      await audioEngine.resumeContext();
      // Short delay so the AudioContext is definitely running
      setTimeout(() => audioEngine.startBgMusic(), 120);
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("click", handleClick);
    document.addEventListener("click", startMusic, { once: true });
    document.addEventListener("keydown", startMusic, { once: true });

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const value: SoundContextValue = {
    playCorrect: () => audioEngine.playCorrect(),
    playWrong: () => audioEngine.playWrong(),
    playGameOver: () => audioEngine.playGameOver(),
    playTimeWarning: () => audioEngine.playTimeWarning(),
    playStageUp: () => audioEngine.playStageUp(),
    playSkip: () => audioEngine.playSkip(),
  };

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────

/** Use inside any Client Component to trigger game sounds. */
export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  // If used outside the provider (shouldn't happen), return no-ops
  if (!ctx) {
    return {
      playCorrect: () => {},
      playWrong: () => {},
      playGameOver: () => {},
      playTimeWarning: () => {},
      playStageUp: () => {},
      playSkip: () => {},
    };
  }
  return ctx;
}
