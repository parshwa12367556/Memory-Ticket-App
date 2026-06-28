import type { User } from "../types";
import type { Tab } from "../components/BottomNav";

const FEATURES = [
  { emoji: "🎟️", title: "Create Tickets", desc: "Turn any photo into a cinematic memory ticket.", grad: "from-[#8a4fff]/30 to-[#5ea3ff]/10" },
  { emoji: "📚", title: "Save Memories", desc: "Local-first SQLite storage. Yours, forever.", grad: "from-[#5ea3ff]/30 to-[#22d3ee]/10" },
  { emoji: "🕒", title: "Timeline View", desc: "Walk back through your year, month by month.", grad: "from-[#c8b6ff]/30 to-[#8a4fff]/10" },
  { emoji: "📱", title: "QR Tickets", desc: "Every memory gets a unique scannable code.", grad: "from-[#ff4f8a]/30 to-[#8a4fff]/10" },
  { emoji: "💜", title: "Mood Tracking", desc: "See what makes you feel — and how often.", grad: "from-[#f0abfc]/30 to-[#c8b6ff]/10" },
  { emoji: "🔗", title: "Share", desc: "Send tickets to friends as image or PDF.", grad: "from-[#86efac]/30 to-[#22d3ee]/10" },
];

const STEPS = [
  ["Register or sign in", "Create your private memory vault."],
  ["Add a memory", "Tap the + button on the dock."],
  ["Upload a photo", "From camera roll or freshly snapped."],
  ["Add the details", "Title, mood, location, story."],
  ["Save your ticket", "We generate a cinematic caption."],
  ["Browse the collection", "Filter by mood, theme or tag."],
  ["Share the moment", "Export as image, PDF or QR."],
];

export function Home({ user, onTab, onOpenMoodAnalytics }: { user: User; onTab: (t: Tab) => void; onOpenMoodAnalytics?: () => void }) {
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return "Late night";
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="relative pb-28">
      {/* Hero */}
      <header className="relative overflow-hidden px-5 pb-8 pt-8">
        <div className="pointer-events-none absolute -top-20 right-[-20%] h-72 w-72 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="pointer-events-none absolute top-10 left-[-10%] h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">{greeting}</p>
          <h1 className="mt-1 text-[28px] font-extrabold leading-tight">
            {user.fullName.split(" ")[0]} <span className="text-gradient">✨</span>
          </h1>
          <p className="mt-1 max-w-xs text-sm text-white/55">
            Welcome back to your memory vault. What story will you ticket today?
          </p>

          <div className="mt-5 flex gap-3">
            <button onClick={() => onTab("add")} className="rounded-2xl bg-gradient-purple px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-900/40 transition active:scale-95">
              + New Memory
            </button>
            <button onClick={() => onTab("gallery")} className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.07]">
              Browse vault
            </button>
          </div>

          {/* Floating ticket preview */}
          <div className="relative mt-7">
            <div className="absolute -right-2 top-2 h-36 w-24 rotate-[10deg] rounded-2xl bg-gradient-to-br from-[#5ea3ff]/40 to-transparent blur-md animate-float-fast" />
            <div className="absolute right-12 -top-2 h-32 w-20 -rotate-[8deg] rounded-2xl bg-gradient-to-br from-[#c8b6ff]/40 to-transparent blur-md animate-float-slow" />
            <div className="glass relative overflow-hidden rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-purple text-white">🎬</div>
                <div>
                  <div className="text-sm font-bold">Did you know?</div>
                  <div className="text-[11px] text-white/55">Your memory cards print like real cinema tickets.</div>
                </div>
              </div>
              <div className="ticket-shine pointer-events-none absolute inset-0 rounded-2xl" />
            </div>
          </div>
        </div>
      </header>

      {/* Features grid */}
      <section className="px-5">
        <SectionTitle title="What you can do" subtitle="Six core powers of your vault" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <button
              key={f.title}
              onClick={f.title === "Mood Tracking" ? onOpenMoodAnalytics : undefined}
              disabled={f.title !== "Mood Tracking"}
              className={`glass relative animate-fade-up overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${f.grad} text-left ${
                f.title === "Mood Tracking"
                  ? "cursor-pointer transition hover:bg-white/[0.06] hover:scale-[1.02] active:scale-[0.98]"
                  : "pointer-events-none"
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="text-2xl">{f.emoji}</div>
              <div className="mt-2 text-sm font-bold">{f.title}</div>
              <div className="mt-0.5 text-[11px] leading-snug text-white/55">{f.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Manual */}
      <section className="mt-8 px-5">
        <SectionTitle title="How it works" subtitle="Seven steps from photo to ticket" />
        <ol className="mt-4 space-y-3">
          {STEPS.map(([title, desc], i) => (
            <li key={title} className="glass flex items-start gap-3 rounded-2xl p-4">
              <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-gradient-purple text-xs font-bold text-white">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <div className="text-sm font-semibold">{title}</div>
                <div className="text-[12px] text-white/55">{desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* About */}
      <section className="mt-8 px-5">
        <SectionTitle title="About" subtitle="A small note from the makers" />
        <div className="glass mt-4 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold">Memory Ticket</div>
              <div className="text-[11px] text-white/45">Version 1.0.0 · Build 2026.01</div>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05]">💜</div>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-white/60">
            Made for the people who screenshot sunsets and keep concert wristbands in a drawer.
            Privacy-first, offline-first, beautifully yours.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {["Privacy Policy", "Terms", "Open Source", "Contact"].map(x => (
              <span key={x} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/65">{x}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-[11px] text-white/45">{subtitle}</p>
      </div>
      <div className="h-px flex-1 ml-3 mb-2 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}
