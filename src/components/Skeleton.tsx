import { cn } from "../utils/cn";

/* ── Generic skeleton block ── */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-white/[0.06]",
        className,
      )}
    />
  );
}

/* ── Gallery card skeleton ── */
export function TicketSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          {/* Glow shadow placeholder */}
          <div className="h-1 w-3/4 mb-2 rounded-full bg-white/[0.04]" />
          <div className="aspect-[3/4.6] w-full rounded-[28px] bg-white/[0.05] overflow-hidden">
            {/* Photo area */}
            <div className="h-[62%] w-full bg-white/[0.08]" />
            {/* Perf line */}
            <div className="mx-6 h-px bg-white/[0.06]" />
            {/* Stub */}
            <div className="h-[34%] space-y-2 px-4 pt-3">
              <div className="h-4 w-3/4 rounded-full bg-white/[0.07]" />
              <div className="h-3 w-1/2 rounded-full bg-white/[0.05]" />
              <div className="flex items-end justify-between pt-2">
                <div className="space-y-1">
                  <div className="h-2 w-10 rounded-full bg-white/[0.05]" />
                  <div className="h-3 w-14 rounded-full bg-white/[0.06]" />
                </div>
                <div className="flex gap-[2px]">
                  {Array.from({ length: 12 }).map((_, j) => (
                    <div key={j} className="w-[2px] rounded-full bg-white/[0.06]" style={{ height: `${6 + ((j * 7) % 12)}px` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Timeline skeleton ── */
export function TimelineSkeleton() {
  return (
    <div className="px-5 pt-4 pb-28 space-y-8 animate-pulse">
      {/* Month headers */}
      {[1, 2, 3].map((_, gi) => (
        <section key={gi} className="relative">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-[42px] w-[42px] rounded-full bg-white/[0.06]" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 rounded-full bg-white/[0.07]" />
              <div className="h-3 w-16 rounded-full bg-white/[0.05]" />
            </div>
          </div>
          <div className="ml-[58px] space-y-3">
            {[1, 2].map((_, ci) => (
              <div key={ci} className="rounded-2xl bg-white/[0.04] overflow-hidden">
                <div className="flex">
                  <div className="h-24 w-24 flex-none bg-white/[0.07]" />
                  <div className="flex-1 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-white/[0.06]" />
                      <div className="h-4 flex-1 rounded-full bg-white/[0.07]" />
                    </div>
                    <div className="h-3 w-1/2 rounded-full bg-white/[0.05]" />
                    <div className="flex items-center justify-between">
                      <div className="h-2 w-16 rounded-full bg-white/[0.05]" />
                      <div className="h-2 w-4 rounded-full bg-white/[0.05]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ── Profile skeleton ── */
export function ProfileSkeleton() {
  return (
    <div className="pb-28 animate-pulse">
      {/* Header */}
      <header className="px-5 pb-5 pt-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/[0.07]" />
          <div className="space-y-2">
            <div className="h-5 w-36 rounded-full bg-white/[0.07]" />
            <div className="h-3 w-48 rounded-full bg-white/[0.05]" />
            <div className="h-3 w-20 rounded-full bg-white/[0.04]" />
          </div>
        </div>
        <div className="mt-4 h-4 w-3/4 rounded-full bg-white/[0.05]" />
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 px-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl bg-white/[0.04] p-4">
            <div className="h-2 w-20 rounded-full bg-white/[0.05]" />
            <div className="mt-2 h-6 w-12 rounded-full bg-white/[0.07]" />
          </div>
        ))}
      </section>

      {/* Achievements */}
      <section className="mt-6 px-5 space-y-3">
        <div className="h-5 w-32 rounded-full bg-white/[0.07]" />
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="aspect-square rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </section>

      {/* Settings */}
      <section className="mt-6 px-5 space-y-3">
        <div className="h-5 w-20 rounded-full bg-white/[0.07]" />
        <div className="rounded-2xl bg-white/[0.04] divide-y divide-white/[0.03]">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <div className="h-9 w-9 rounded-xl bg-white/[0.06]" />
              <div className="h-4 flex-1 rounded-full bg-white/[0.06]" />
              <div className="h-4 w-4 rounded-full bg-white/[0.04]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Mood Analytics skeleton ── */
export function MoodAnalyticsSkeleton() {
  return (
    <div className="pb-24 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/[0.06]" />
          <div className="space-y-1">
            <div className="h-5 w-36 rounded-full bg-white/[0.07]" />
            <div className="h-3 w-20 rounded-full bg-white/[0.05]" />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 px-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl bg-white/[0.04] p-4">
            <div className="h-2 w-20 rounded-full bg-white/[0.05]" />
            <div className="mt-2 h-6 w-12 rounded-full bg-white/[0.07]" />
          </div>
        ))}
      </div>

      {/* Distribution bars */}
      <div className="mx-5 mt-6 rounded-2xl bg-white/[0.04] p-5 space-y-4">
        <div className="h-4 w-28 rounded-full bg-white/[0.07]" />
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-white/[0.06]" />
            <div className="h-4 w-16 rounded-full bg-white/[0.05]" />
            <div className="h-3 flex-1 rounded-full bg-white/[0.06]" />
            <div className="h-4 w-6 rounded-full bg-white/[0.05]" />
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="mx-5 mt-6 rounded-2xl bg-white/[0.04] p-5 space-y-3">
        <div className="h-4 w-32 rounded-full bg-white/[0.07]" />
        <div className="grid grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-xl bg-white/[0.05] p-3 space-y-2">
              <div className="h-3 w-12 rounded-full bg-white/[0.06]" />
              <div className="flex gap-1">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-3 w-3 rounded-full bg-white/[0.05]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Full-screen loading overlay ── */
export function FullScreenLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="flex items-center gap-2">
        <svg className="animate-spin h-5 w-5 text-[var(--color-lavender)]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-medium text-white/60">{label}</span>
      </div>
    </div>
  );
}
