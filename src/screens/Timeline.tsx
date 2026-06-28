import { useMemo, useRef, useState } from "react";
import type { MemoryTicket } from "../types";
import { MOODS } from "../types";
import { TimelineSkeleton } from "../components/Skeleton";
import { useTicketShare } from "../hooks/useTicketShare";
import { useToast } from "../hooks/useToast";

export function Timeline({ memories, isLoading, onOpen }: { memories: MemoryTicket[]; isLoading?: boolean; onOpen: (m: MemoryTicket) => void }) {
  const [processing, setProcessing] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { showToast, ToastUI } = useToast();

  const { shareImage } = useTicketShare();

  const onShareImage = async (m: MemoryTicket) => {
    const el = cardRefs.current.get(m.id);
    if (!el || processing) return;
    setProcessing(m.id);
    await shareImage(el, m, showToast);
    setProcessing(null);
  };
  const grouped = useMemo(() => {
    const map = new Map<string, MemoryTicket[]>();
    [...memories]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .forEach(m => {
        const d = new Date(m.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(m);
      });
    return Array.from(map.entries());
  }, [memories]);

  return (
    <div className="pb-28">
      <header className="px-5 pb-2 pt-7">
        <h1 className="text-2xl font-extrabold">Timeline</h1>
        <p className="text-[12px] text-white/50">A walk through your year</p>
      </header>

      {isLoading ? (
        <TimelineSkeleton />
      ) : memories.length === 0 ? (
        <div className="glass mx-5 mt-8 rounded-3xl px-6 py-10 text-center">
          <div className="text-5xl">🕰️</div>
          <h3 className="mt-3 text-base font-bold">Your timeline is empty</h3>
          <p className="mt-1 text-[12px] text-white/55">Save a memory to start your story.</p>
        </div>
      ) : (
        <div className="relative px-5 pt-4">
          {/* Vertical line */}
          <div className="absolute left-[34px] top-6 bottom-4 w-px bg-gradient-to-b from-[var(--color-purple)]/60 via-white/10 to-transparent" />

          {grouped.map(([key, list], gi) => {
            const [y, m] = key.split("-").map(Number);
            const date = new Date(y, m, 1);
            const monthLabel = date.toLocaleString("en", { month: "long" });
            return (
              <section key={key} className="relative mb-7 animate-fade-up" style={{ animationDelay: `${gi * 0.05}s` }}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-[42px] w-[42px] flex-none place-items-center rounded-full border border-white/10 bg-[#171722] text-center shadow-lg shadow-purple-900/30">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-white/45">{monthLabel.slice(0,3)}</div>
                      <div className="-mt-0.5 text-[11px] font-bold text-white">{y}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-bold">{monthLabel} {y}</div>
                    <div className="text-[11px] text-white/45">{list.length} memor{list.length === 1 ? "y" : "ies"}</div>
                  </div>
                </div>

                <div className="ml-[58px] space-y-3">
                  {list.map(m => {
                    const moodMeta = MOODS.find(x => x.id === m.mood);
                    return (
                      <div
                        key={m.id}
                        ref={(el) => { if (el) cardRefs.current.set(m.id, el); }}
                        className="relative"
                      >
                        <button
                          onClick={() => onOpen(m)}
                          className="glass group block w-full overflow-hidden rounded-2xl text-left transition hover:bg-white/[0.06]"
                        >
                        <div className="flex">
                          <div className="relative h-24 w-24 flex-none overflow-hidden">
                            <img src={m.imageUrl} alt={m.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#171722]/40" />
                          </div>
                          <div className="flex flex-1 flex-col justify-between p-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="grid h-5 w-5 place-items-center rounded-full text-[10px]"
                                  style={{ backgroundColor: `${moodMeta?.color}33`, color: moodMeta?.color }}
                                >
                                  {moodMeta?.emoji}
                                </span>
                                <h4 className="line-clamp-1 text-sm font-bold">{m.title}</h4>
                              </div>
                              <p className="mt-0.5 line-clamp-1 text-[11px] text-white/50">{m.location}</p>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-white/45">
                              <span>{new Date(m.createdAt).toLocaleDateString("en", { day: "numeric", month: "short" })}</span>
                              {m.favorite && <span className="text-rose-400">♥</span>}
                            </div>
                          </div>
                        </div>
                      </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onShareImage(m); }}
                          disabled={processing === m.id}
                          className="absolute bottom-2 right-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white/60 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/80 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
                          title={processing === m.id ? "Processing…" : "Share ticket"}
                        >
                          {processing === m.id ? (
                            <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
        {ToastUI}
    </div>
  );
}
