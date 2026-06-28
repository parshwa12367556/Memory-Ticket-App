import { useMemo } from "react";
import { MOODS, type MemoryTicket } from "../types";
import { MoodAnalyticsSkeleton } from "../components/Skeleton";

interface Props {
  memories: MemoryTicket[];
  isLoading?: boolean;
  onClose: () => void;
}

/* ── Mood Analytics Dashboard ── */
export function MoodAnalytics({ memories, isLoading, onClose }: Props) {
  // Hooks before any early return
  const { moodCounts, total, mostCommonMood, mostCommonCount, distinctMoods, timeline, lastMood, streak } = useMemo(() => {
    const counts = new Map<string, { count: number; memories: MemoryTicket[] }>();
    MOODS.forEach(m => counts.set(m.id, { count: 0, memories: [] }));

    const sorted = [...memories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    sorted.forEach(m => {
      const entry = counts.get(m.mood);
      if (entry) {
        entry.count++;
        entry.memories.push(m);
      }
    });

    // Timeline: mood snapshot per month (last 6 months with data)
    const monthMap = new Map<string, MemoryTicket[]>();
    sorted.forEach(m => {
      const d = new Date(m.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap.has(key)) monthMap.set(key, []);
      monthMap.get(key)!.push(m);
    });

    const timeline = Array.from(monthMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .map(([key, ms]) => {
        const moodGroup = new Map<string, number>();
        ms.forEach(m => moodGroup.set(m.mood, (moodGroup.get(m.mood) ?? 0) + 1));
        const top = Array.from(moodGroup.entries()).sort((a, b) => b[1] - a[1])[0];
        const [y, m] = key.split("-").map(Number);
        return {
          key,
          label: new Date(y, m - 1).toLocaleString("en", { month: "short", year: "2-digit" }),
          total: ms.length,
          moods: Array.from(moodGroup.entries()).sort((a, b) => b[1] - a[1]),
          topMood: top?.[0] as typeof MOODS[number]["id"] | undefined,
        };
      });

    // Most common mood
    const top = Array.from(counts.entries())
      .map(([mood, data]) => ({ mood, count: data.count }))
      .sort((a, b) => b.count - a.count);

    // Streak: longest consecutive same-mood run
    let maxStreak = 0;
    let currentStreak = 1;
    let maxStreakMood = "";
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].mood === sorted[i - 1].mood) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          maxStreakMood = sorted[i].mood;
        }
      } else {
        currentStreak = 1;
      }
    }

    return {
      moodCounts: Array.from(counts.entries()).map(([mood, data]) => ({ mood, count: data.count })),
      total: memories.length,
      mostCommonMood: top[0]?.mood ?? null,
      mostCommonCount: top[0]?.count ?? 0,
      distinctMoods: Array.from(counts.values()).filter(d => d.count > 0).length,
      timeline,
      lastMood: sorted[0]?.mood ?? null,
      streak: maxStreak > 1 ? { mood: maxStreakMood, count: maxStreak } : null,
    };
  }, [memories]);

  if (isLoading) return <MoodAnalyticsSkeleton />;

  const maxCount = Math.max(...moodCounts.map(m => m.count), 1);

  return (
    <div className="fixed inset-0 z-40 flex animate-fade-in flex-col overflow-y-auto bg-[#09090f]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#09090f]/85 px-5 pb-4 pt-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80 transition hover:bg-white/[0.07]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
              <h1 className="text-lg font-extrabold">Mood Analytics</h1>
              <p className="text-[11px] text-white/45">Your emotional landscape</p>
            </div>
          </div>
          {total > 0 && (
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-white/65">
              {total} total
            </div>
          )}
        </div>
      </header>

      {total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl">📊</div>
          <h3 className="mt-3 text-base font-bold">No data yet</h3>
          <p className="mt-1 text-[12px] text-white/55">Add some memories to see your mood analytics.</p>
        </div>
      ) : (
        <div className="pb-24">
          {/* Key Stats */}
          <section className="mx-5 mt-5 grid grid-cols-2 gap-3">
            <StatCard
              icon="🎭"
              label="Most Common"
              value={mostCommonMood ? getMoodMeta(mostCommonMood)?.emoji + " " + mostCommonMood : "—"}
              sub={mostCommonCount > 0 ? `${mostCommonCount} memory${mostCommonCount !== 1 ? "ies" : "y"}` : ""}
              color={getMoodMeta(mostCommonMood)?.color}
            />
            <StatCard
              icon="🎨"
              label="Mood Diversity"
              value={`${distinctMoods} / ${MOODS.length}`}
              sub={`${Math.round((distinctMoods / MOODS.length) * 100)}% of moods felt`}
              color="#c8b6ff"
            />
            <StatCard
              icon="🔥"
              label="Best Streak"
              value={streak ? `${streak.count}x` : "—"}
              sub={streak ? getMoodMeta(streak.mood)?.emoji + " " + streak.mood : "No streaks yet"}
              color="#ff9f7a"
            />
            <StatCard
              icon="💫"
              label="Latest Mood"
              value={lastMood ? getMoodMeta(lastMood)?.emoji + " " + lastMood : "—"}
              sub={lastMood ? "Your most recent memory" : ""}
              color={getMoodMeta(lastMood)?.color}
            />
          </section>

          {/* Mood Distribution Bar Chart */}
          <section className="mx-5 mt-7">
            <h2 className="text-base font-bold">Mood Distribution</h2>
            <p className="text-[11px] text-white/45">How each mood stacks up</p>
            <div className="glass mt-3 space-y-2.5 rounded-2xl p-5">
              {moodCounts.map(({ mood, count }) => {
                const meta = getMoodMeta(mood);
                const pct = total > 0 ? (count / total) * 100 : 0;
                const widthPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={mood} className="flex items-center gap-3">
                    <span className="w-6 text-center text-base">{meta?.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-white/80">{mood}</span>
                        <span className="text-white/50">{count} <span className="text-white/30">({pct.toFixed(0)}%)</span></span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${widthPct}%`,
                            backgroundColor: meta?.color ?? "#8a4fff",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Mood Timeline (last months) */}
          <section className="mx-5 mt-7">
            <h2 className="text-base font-bold">Mood Timeline</h2>
            <p className="text-[11px] text-white/45">Your dominant mood month by month</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {timeline.length === 0 ? (
                <div className="glass col-span-2 rounded-2xl p-5 text-center text-[12px] text-white/55">
                  Not enough data across months yet.
                </div>
              ) : (
                timeline.map(month => {
                  const meta = month.topMood ? getMoodMeta(month.topMood) : null;
                  return (
                    <div key={month.key} className="glass relative overflow-hidden rounded-2xl p-4">
                      {/* Glow */}
                      <div
                        className="absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl opacity-30"
                        style={{ backgroundColor: meta?.color ?? "#8a4fff" }}
                      />
                      <div className="relative">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-white/45">{month.label}</div>
                        <div className="mt-1.5 flex items-center gap-1.5 text-lg">
                          <span>{meta?.emoji ?? "💭"}</span>
                          <span className="text-base font-bold text-white/90">{month.topMood ?? "Mixed"}</span>
                        </div>
                        {/* Mood bar dots */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {month.moods.slice(0, 4).map(([m, c]) => {
                            const mMeta = getMoodMeta(m);
                            return (
                              <span
                                key={m}
                                className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/60"
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: mMeta?.color ?? "#8a4fff" }}
                                />
                                {mMeta?.emoji} {c}
                              </span>
                            );
                          })}
                        </div>
                        <div className="mt-1.5 text-[10px] text-white/40">{month.total} memor{month.total === 1 ? "y" : "ies"}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Mood Legend */}
          <section className="mx-5 mt-7">
            <h2 className="text-base font-bold">All Moods</h2>
            <p className="text-[11px] text-white/45">Colors of your emotional palette</p>
            <div className="glass mt-3 flex flex-wrap gap-2 rounded-2xl p-4">
              {MOODS.map(meta => {
                const count = moodCounts.find(m => m.mood === meta.id)?.count ?? 0;
                return (
                  <span
                    key={meta.id}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/75"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                    {meta.emoji} {meta.id}
                    <span className="text-white/40">({count})</span>
                  </span>
                );
              })}
            </div>
          </section>

          {/* Insight */}
          {streak && (
            <section className="mx-5 mt-6">
              <div className="glass rounded-2xl border-l-2 border-[#ff9f7a] bg-gradient-to-r from-[#ff9f7a]/10 to-transparent p-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <div>
                    <div className="text-sm font-bold">Mood Streak!</div>
                    <div className="text-[11px] text-white/55">
                      You recorded <strong className="text-white/80">{streak.count}</strong> consecutive{" "}
                      {getMoodMeta(streak.mood)?.emoji} {streak.mood} memories.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Footer */}
          <div className="mt-8 px-5 text-center text-[10px] text-white/30">
            Mood Analytics · Powered by Memory Ticket
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */

function getMoodMeta(mood: string | null) {
  return MOODS.find(m => m.id === mood) ?? null;
}

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub: string; color?: string }) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4">
      {color && (
        <div className="absolute -right-5 -top-5 h-14 w-14 rounded-full blur-2xl opacity-25" style={{ backgroundColor: color }} />
      )}
      <div className="relative">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{icon}</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/45">{label}</span>
        </div>
        <div className="mt-1 line-clamp-1 text-base font-bold text-white">{value}</div>
        <div className="mt-0.5 line-clamp-1 text-[10px] text-white/40">{sub}</div>
      </div>
    </div>
  );
}
