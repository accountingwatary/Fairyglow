"use client";

import { useId } from "react";

export function BottleArt({ small = false }: { small?: boolean }) {
  const id = useId().replace(/:/g, "");
  const glow = `glow-${id}`;
  const glass = `glass-${id}`;
  const blur = `blur-${id}`;

  return (
    <svg className={small ? "bottle-art small" : "bottle-art"} viewBox="0 0 360 520" role="img" aria-label="A glowing potion bottle">
      <defs>
        <radialGradient id={glow} cx="50%" cy="58%" r="52%">
          <stop offset="0%" stopColor="#f4ffc4" />
          <stop offset="42%" stopColor="#b6ff57" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#143018" stopOpacity="0.05" />
        </radialGradient>
        <linearGradient id={glass} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eaff9a" />
          <stop offset="100%" stopColor="#7dff9a" stopOpacity="0.35" />
        </linearGradient>
        <filter id={blur}>
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <rect x="148" y="28" width="64" height="48" rx="10" fill="#c4a574" />
      <rect x="158" y="38" width="44" height="8" rx="4" fill="#f0e2bf" opacity="0.8" />
      <path d="M160 76h40v34h-40z" fill="#102016" stroke={`url(#${glass})`} strokeWidth="3" />
      <path
        d="M160 108c-8 36-70 58-70 146 0 112 40 188 90 188s90-76 90-188c0-88-62-110-70-146z"
        fill="#0c1610"
        stroke={`url(#${glass})`}
        strokeWidth="3"
      />
      <ellipse cx="180" cy="292" rx="78" ry="96" fill={`url(#${glow})`} filter={`url(#${blur})`} />
      <ellipse cx="146" cy="386" rx="30" ry="14" fill="#2f5a30" />
      <ellipse cx="196" cy="398" rx="40" ry="16" fill="#1b3a22" />
      <ellipse cx="214" cy="372" rx="22" ry="12" fill="#79c47a" />
      <path d="M206 246a30 30 0 1 0 .2 46 23 23 0 1 1-.2-46z" fill="#f7f8ef" />
      <circle cx="148" cy="250" r="4" fill="#f4ffc4" />
      <circle cx="168" cy="220" r="3" fill="#eaff9a" />
      <circle cx="214" cy="274" r="5" fill="#d8ff57" />
      <circle cx="188" cy="198" r="2.4" fill="#ffffff" />
      <circle cx="230" cy="236" r="2" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}
