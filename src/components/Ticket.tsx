import { forwardRef } from "react";
import { TICKET_THEMES, type MemoryTicket } from "../types";
import { cn } from "../utils/cn";

interface TicketProps {
  memory: MemoryTicket;
  onClick?: () => void;
  onToggleFav?: () => void;
  onDownload?: () => void;
  downloading?: boolean;
  variant?: "card" | "preview";
}

export const Ticket = forwardRef<HTMLButtonElement, TicketProps>(
function Ticket({ memory, onClick, onToggleFav, onDownload, downloading, variant = "card" }, ref) {
  const theme = TICKET_THEMES.find(t => t.id === memory.theme) ?? TICKET_THEMES[0];
  const date = new Date(memory.createdAt);
  const month = date.toLocaleString("en", { month: "short" }).toUpperCase();
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  // unique id needed for SVG mask if multiple tickets share the DOM
  const maskId = `ticket-mask-${memory.id}`;

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn(
        "group relative w-full text-left animate-ticket-unfold",
        "transition-transform duration-300 hover:-translate-y-1",
        variant === "preview" && "pointer-events-none"
      )}
    >
      {/* Glow shadow underneath */}
      <div className={cn(
        "absolute -inset-2 rounded-[28px] opacity-50 blur-2xl transition-opacity",
        "bg-gradient-to-br", theme.gradient,
        "group-hover:opacity-80"
      )} />

      {/* SVG mask creating the ticket shape with side notches */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <mask id={maskId} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
            <rect width="1" height="1" fill="white" rx="0.05" />
            {/* perforation notches around 62% down */}
            <circle cx="0" cy="0.62" r="0.025" fill="black" />
            <circle cx="1" cy="0.62" r="0.025" fill="black" />
          </mask>
        </defs>
      </svg>

      <div
        className="relative aspect-[3/4.6] w-full overflow-hidden rounded-[28px] bg-[#171722]"
        style={{ WebkitMask: `url(#${maskId})`, mask: `url(#${maskId})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%" }}
      >
        {/* Photo */}
        <div className="relative h-[62%] w-full overflow-hidden">
          <img
            src={memory.imageUrl}
            alt={memory.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {/* Gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#171722] via-[#171722]/30 to-transparent" />
          {/* Theme tag */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            <span>{theme.emoji}</span>{theme.label}
          </div>
          {/* Favorite */}
          {onToggleFav && (
            <span
              onClick={(e) => { e.stopPropagation(); onToggleFav(); }}
              className={cn(
                "absolute right-3 top-3 grid h-8 w-8 cursor-pointer place-items-center rounded-full backdrop-blur-md transition",
                memory.favorite ? "bg-rose-500/90 text-white" : "bg-black/40 text-white/80 hover:bg-black/60"
              )}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={memory.favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </span>
          )}
          {/* Date stub */}
          <div className="absolute bottom-3 left-3 rounded-xl bg-black/50 px-2.5 py-1.5 text-white backdrop-blur-md">
            <div className="text-[9px] font-medium tracking-[0.2em] text-white/60">{month} {year}</div>
            <div className="-mt-0.5 text-xl font-bold leading-none">{day}</div>
          </div>
          {/* Shine */}
          <div className="ticket-shine pointer-events-none absolute inset-0" />
        </div>

        {/* Perforation dashed line */}
        <div className="relative">
          <div className="mx-6 border-t border-dashed border-white/15" />
        </div>

        {/* Stub */}
        <div className="flex h-[34%] flex-col justify-between px-4 pb-4 pt-3">
          <div>
            <h3 className="line-clamp-1 text-base font-bold text-white">{memory.title}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/55">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span className="line-clamp-1">{memory.location}</span>
            </p>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/40">Mood</div>
              <div className="text-xs font-semibold text-white/90">{memory.mood}</div>
            </div>
            {/* Barcode */}
            <div className="flex h-7 items-end gap-[2px]">
              {Array.from({ length: 22 }).map((_, i) => (
                <span
                  key={i}
                  className="w-[2px] bg-white/70"
                  style={{ height: `${(((i * 37) % 100) + 30) * 0.28}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Download / share button — card variant only */}
        {onDownload && variant === "card" && (
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            disabled={downloading}
            className="absolute bottom-2 right-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white/60 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-black/80 hover:text-white opacity-60 group-hover:opacity-100 focus:opacity-100 disabled:opacity-40 disabled:pointer-events-none"
            title={downloading ? "Processing…" : "Share ticket"}
          >
            {downloading ? (
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
        )}
      </div>
    </button>
  );
});
