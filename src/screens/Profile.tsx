import React, { useMemo } from "react";
import type { MemoryTicket, User } from "../types";
import { ProfileSkeleton } from "../components/Skeleton";

const ACHIEVEMENTS = [
  { id: "first",   name: "First Memory",     emoji: "🌱", need: 1 },
  { id: "ten",     name: "10 Memories",      emoji: "🎟️", need: 10 },
  { id: "collect", name: "Memory Collector", emoji: "📚", need: 25 },
  { id: "story",   name: "Story Keeper",     emoji: "✍️", need: 50 },
  { id: "explore", name: "Explorer",         emoji: "🌍", need: 100 },
];

interface Props {
  user: User;
  memories: MemoryTicket[];
  isLoading?: boolean;
  onLogout: () => void;
  onClear: () => void;
  onBackup: () => void;
  onRestore: () => void;
  onOpenMoodAnalytics?: () => void;
  onOpenMemoryMap?: () => void;
}

export function Profile({ user, memories, isLoading, onLogout, onClear, onBackup, onRestore, onOpenMoodAnalytics, onOpenMemoryMap }: Props) {
  // Hooks must be called before any early return
  const stats = useMemo(() => {
    const moodCount = new Map<string, number>();
    const locCount = new Map<string, number>();
    memories.forEach(m => {
      moodCount.set(m.mood, (moodCount.get(m.mood) ?? 0) + 1);
      locCount.set(m.location, (locCount.get(m.location) ?? 0) + 1);
    });
    const top = (m: Map<string, number>) =>
      Array.from(m.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return {
      total: memories.length,
      favorites: memories.filter(m => m.favorite).length,
      mood: top(moodCount),
      location: top(locCount),
    };
  }, [memories]);

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="pb-28">
      <header className="relative overflow-hidden px-5 pb-5 pt-8">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-purple text-2xl font-bold text-white shadow-lg shadow-purple-900/40">
            {user.fullName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-extrabold">{user.fullName}</div>
            <div className="text-[12px] text-white/55">{user.email}</div>
            <div className="mt-0.5 text-[11px] text-white/45">📍 {user.city}</div>
          </div>
        </div>
        <p className="mt-4 text-[13px] italic text-white/70">"{user.bio}"</p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 px-5">
        <Stat label="Total memories" value={stats.total.toString()} accent="from-[#8a4fff] to-[#5ea3ff]" />
        <Stat label="Favorites"      value={stats.favorites.toString()} accent="from-[#ff4f8a] to-[#8a4fff]" />
        <Stat label="Top mood"       value={stats.mood} accent="from-[#c8b6ff] to-[#5ea3ff]" />
        <Stat label="Most visited"   value={stats.location} accent="from-[#22d3ee] to-[#5ea3ff]" />
      </section>

      {/* Achievements */}
      <section className="mt-6 px-5">
        <h2 className="text-lg font-bold">Achievements</h2>
        <p className="text-[11px] text-white/45">Badges you've collected</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {ACHIEVEMENTS.map(a => {
            const unlocked = stats.total >= a.need;
            return (
              <div
                key={a.id}
                className={`glass relative flex aspect-square flex-col items-center justify-center rounded-2xl p-2 text-center transition ${
                  unlocked ? "" : "opacity-30 grayscale"
                }`}
              >
                <div className="text-2xl">{a.emoji}</div>
                <div className="mt-1 text-[9px] font-semibold leading-tight">{a.name}</div>
                {unlocked && (
                  <div className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[9px] font-bold">✓</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Settings */}
      <section className="mt-6 px-5">
        <h2 className="text-lg font-bold">Settings</h2>
        <div className="glass mt-3 divide-y divide-white/5 rounded-2xl">
          <Row icon="🌙" label="Dark mode" right={<Pill>Always on</Pill>} />
          <Row icon="🔔" label="Notifications" right={<Toggle on />} />
          <Row icon="📊" label="Mood Analytics" onClick={onOpenMoodAnalytics} right={<Chevron />} />
          <Row icon="🗺️" label="Memory Map" onClick={onOpenMemoryMap} right={<Chevron />} />
          <Row icon="📦" label="Backup data" onClick={onBackup} right={<Chevron />} />
          <Row icon="♻️" label="Restore data" onClick={onRestore} right={<Chevron />} />
          <Row icon="🗑️" label="Clear all memories" onClick={onClear} danger right={<Chevron />} />
          <Row icon="🚪" label="Sign out" onClick={onLogout} right={<Chevron />} />
        </div>
      </section>

      {/* Footer */}
      <section className="mt-6 px-5 text-center text-[11px] text-white/35">
        Memory Ticket · v1.0.0 · Made with 💜
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4">
      <div className={`absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br ${accent} opacity-30 blur-2xl`} />
      <div className="relative">
        <div className="text-[10px] font-medium uppercase tracking-wider text-white/45">{label}</div>
        <div className="mt-1 line-clamp-1 text-lg font-bold">{value}</div>
      </div>
    </div>
  );
}

function Row({
  icon, label, right, onClick, danger,
}: { icon: string; label: string; right?: React.ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.03] ${danger ? "text-rose-300" : "text-white/85"}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05] text-base">{icon}</span>
      <span className="flex-1 text-sm font-semibold">{label}</span>
      {right}
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/65">{children}</span>;
}
function Toggle({ on }: { on?: boolean }) {
  return (
    <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${on ? "bg-gradient-purple" : "bg-white/15"}`}>
      <span className={`inline-block h-4 w-4 rounded-full bg-white transition ${on ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </span>
  );
}
function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/40"><path d="m9 18 6-6-6-6"/></svg>
  );
}
