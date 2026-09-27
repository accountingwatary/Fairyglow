import type { CSSProperties } from "react";

const flies = Array.from({ length: 18 }, (_, index) => {
  const seed = (index * 7919) % 97;
  return {
    left: `${(index * 37 + seed) % 100}%`,
    top: `${(index * 53 + seed * 3) % 100}%`,
    size: `${2 + (seed % 3)}px`,
    duration: `${14 + (seed % 12)}s`,
    delay: `-${(seed % 17) * 1.3}s`,
    dx: `${((seed % 9) - 4) * 14}px`,
    dy: `${-40 - (seed % 7) * 16}px`,
  };
});

export function Fireflies({ className = "fireflies", count = flies.length }: { className?: string; count?: number }) {
  return (
    <span className={className} aria-hidden="true">
      {flies.slice(0, count).map((fly, index) => (
        <i
          key={index}
          style={
            {
              left: fly.left,
              top: fly.top,
              width: fly.size,
              height: fly.size,
              animationDuration: `${fly.duration}, 3.${index % 9}s`,
              animationDelay: `${fly.delay}, -${index % 5}s`,
              "--dx": fly.dx,
              "--dy": fly.dy,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
