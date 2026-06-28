import { useEffect } from "react";
import { Particles } from "../components/Particles";

export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-aurora overflow-hidden">
      <Particles count={24} />

      {/* Floating ticket silhouettes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-6 top-20 h-28 w-20 rounded-2xl bg-gradient-to-br from-[#8a4fff]/30 to-transparent blur-md animate-float-slow" />
        <div className="absolute right-8 top-32 h-24 w-16 rounded-2xl bg-gradient-to-br from-[#5ea3ff]/30 to-transparent blur-md animate-float-fast" />
        <div className="absolute bottom-32 left-10 h-20 w-14 rounded-2xl bg-gradient-to-br from-[#c8b6ff]/30 to-transparent blur-md animate-float-fast" />
      </div>

      <div className="relative z-10 flex flex-col items-center animate-scale-in">
        <div className="relative grid h-24 w-24 place-items-center rounded-[28px] bg-gradient-purple text-white shadow-2xl shadow-purple-900/60 animate-pulse-glow">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"/>
            <path d="M9 7v10M15 7v10"/>
          </svg>
          {/* Orbit ring */}
          <div className="absolute -inset-4 rounded-full border border-white/10 animate-spin-slow" />
        </div>

        <h1 className="mt-7 text-4xl font-extrabold tracking-tight text-gradient animate-fade-up">
          Memory Ticket
        </h1>
        <p className="mt-2 text-sm font-medium text-white/55 animate-fade-up" style={{ animationDelay: "0.15s" }}>
          Every Memory Deserves a Ticket
        </p>

        {/* Loader dots */}
        <div className="mt-10 flex gap-1.5">
          {[0,1,2].map(i => (
            <span key={i}
              className="h-1.5 w-1.5 rounded-full bg-white/60"
              style={{ animation: `fade-in 1s ${i*0.2}s infinite alternate` }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 text-[10px] tracking-[0.3em] text-white/30">
        v1.0 · MEMORY TICKET STUDIO
      </div>
    </div>
  );
}
