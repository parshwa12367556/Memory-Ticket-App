import React, { useMemo, useRef, useState } from "react";
import { Ticket } from "../components/Ticket";
import { TICKET_THEMES, type MemoryTicket, type TicketTheme } from "../types";
import { cn } from "../utils/cn";
import { TicketSkeleton } from "../components/Skeleton";
import { useTicketShare } from "../hooks/useTicketShare";
import { useToast } from "../hooks/useToast";

interface Props {
  memories: MemoryTicket[];
  isLoading?: boolean;
  onOpen: (m: MemoryTicket) => void;
  onFav: (id: string) => void;
  onAdd: () => void;
}

type Filter = "all" | "favorites" | TicketTheme;

export function Gallery({ memories, isLoading, onOpen, onFav, onAdd }: Props) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [processing, setProcessing] = useState<string | null>(null);
  const ticketRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const { showToast, ToastUI } = useToast();

  const { shareImage } = useTicketShare();

  const onShareImage = async (m: MemoryTicket) => {
    const el = ticketRefs.current.get(m.id);
    if (!el || processing) return;
    setProcessing(m.id);
    await shareImage(el, m, showToast);
    setProcessing(null);
  };

  const filtered = useMemo(() => {
    return memories.filter(m => {
      if (filter === "favorites" && !m.favorite) return false;
      if (filter !== "all" && filter !== "favorites" && m.theme !== filter) return false;
      if (q.trim()) {
        const needle = q.toLowerCase();
        return (
          m.title.toLowerCase().includes(needle) ||
          m.location.toLowerCase().includes(needle) ||
          m.mood.toLowerCase().includes(needle) ||
          m.tags.some(t => t.toLowerCase().includes(needle))
        );
      }
      return true;
    });
  }, [memories, q, filter]);

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#09090f]/85 px-5 pb-3 pt-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Your Tickets</h1>
            <p className="text-[12px] text-white/50">{memories.length} memories in your vault</p>
          </div>
          <button onClick={onAdd} className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-purple text-white shadow-md shadow-purple-900/40 transition active:scale-95">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search title, place, mood, tag…"
            className="w-full bg-transparent text-sm text-white placeholder-white/35 outline-none"
          />
          {q && <button onClick={() => setQ("")} className="text-white/40 hover:text-white">✕</button>}
        </div>

        {/* Filters */}
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
          <Chip active={filter === "favorites"} onClick={() => setFilter("favorites")}>♥ Favorites</Chip>
          {TICKET_THEMES.map(t => (
            <Chip key={t.id} active={filter === t.id} onClick={() => setFilter(t.id)}>
              <span className="mr-1">{t.emoji}</span>{t.label}
            </Chip>
          ))}
        </div>
      </header>

      <div className="px-4 pt-4">
        {isLoading ? (
          <div className="pb-28">
            <TicketSkeleton count={4} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={onAdd} hasQuery={q.length > 0 || filter !== "all"} />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((m, i) => (
              <div key={m.id} style={{ animationDelay: `${i * 0.04}s` }} className="animate-fade-up">
                <Ticket
                  ref={(el) => { if (el) ticketRefs.current.set(m.id, el); }}
                  memory={m}
                  onClick={() => onOpen(m)}
                  onToggleFav={() => onFav(m.id)}
                  downloading={processing === m.id}
                  onDownload={() => onShareImage(m)}
                />
              </div>
            ))}
          </div>
        )}
        {ToastUI}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
        active
          ? "border-transparent bg-gradient-purple text-white shadow-md shadow-purple-900/30"
          : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08]"
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ onAdd, hasQuery }: { onAdd: () => void; hasQuery: boolean }) {
  return (
    <div className="glass mt-10 flex flex-col items-center rounded-3xl px-6 py-10 text-center">
      <div className="text-5xl">🎟️</div>
      <h3 className="mt-3 text-base font-bold">
        {hasQuery ? "No tickets match that filter" : "Your vault is waiting"}
      </h3>
      <p className="mt-1 max-w-xs text-[12px] text-white/55">
        {hasQuery ? "Try clearing the search or pick a different theme." : "Add your first memory to bring this place to life."}
      </p>
      <button onClick={onAdd} className="mt-5 rounded-2xl bg-gradient-purple px-5 py-3 text-sm font-bold text-white shadow-md shadow-purple-900/40 transition active:scale-95">
        + Create your first ticket
      </button>
    </div>
  );
}
