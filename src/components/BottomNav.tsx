import React from "react";
import { cn } from "../utils/cn";

export type Tab = "home" | "gallery" | "add" | "timeline" | "profile";

const ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z"/></svg>
  )},
  { id: "gallery", label: "Tickets", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 1 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 1 0 0-4V7Z"/><path d="M14 5v14"/></svg>
  )},
  { id: "add", label: "Add", icon: null },
  { id: "timeline", label: "Timeline", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
  )},
  { id: "profile", label: "Profile", icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
  )},
];

export function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="pointer-events-none sticky bottom-0 z-30 mt-auto px-3 pb-3 pt-2">
      <nav className="pointer-events-auto relative mx-auto flex max-w-md items-center justify-between rounded-2xl border border-white/10 bg-[#0e0e18]/85 px-2 py-2 backdrop-blur-xl">
        {ITEMS.map(item => {
          if (item.id === "add") {
            return (
              <button
                key={item.id}
                onClick={() => onChange("add")}
                className="relative -mt-7 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-purple text-white shadow-lg shadow-purple-900/40 transition active:scale-95 animate-pulse-glow"
                aria-label="Add memory"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            );
          }
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-medium transition",
                isActive ? "text-white" : "text-white/45 hover:text-white/80"
              )}
            >
              <span className={cn("transition", isActive && "text-[var(--color-lavender)]")}>{item.icon}</span>
              <span>{item.label}</span>
              {isActive && <span className="mt-0.5 h-1 w-1 rounded-full bg-[var(--color-lavender)]" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
