import type { CSSProperties } from "react";

export function Particles({ count = 18 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 53) % 100;
        const delay = (i * 0.35) % 6;
        const dx = ((i * 17) % 80) - 40;
        const size = 4 + ((i * 3) % 6);

        return (
          <span
            key={i}
            className="particle"
            style={{
              left: `${left}%`,
              bottom: `${-10 - (i % 4) * 6}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${delay}s`,
              "--dx": `${dx}px`,
            } as CSSProperties & { [key: string]: string | number }}
          />
        );
      })}
    </div>
  );
}
