import React, { useEffect, useState } from "react";
import { Splash } from "./screens/Splash";
import { Auth } from "./screens/Auth";
import { Home } from "./screens/Home";
import { Gallery } from "./screens/Gallery";
import { AddMemory } from "./screens/AddMemory";
import { Timeline } from "./screens/Timeline";
import { Profile } from "./screens/Profile";
import { MemoryDetails } from "./screens/MemoryDetails";
import { MoodAnalytics } from "./screens/MoodAnalytics";
import { MemoryMap } from "./screens/MemoryMap";
import { BottomNav, type Tab } from "./components/BottomNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import {
  clearAllMemories,
  deleteMemory,
  ensureSeed,
  getMemories,
  getSession,
  getUsers,
  setSession,
  toggleFavorite,
} from "./storage";
import type { MemoryTicket, User } from "./types";

type Stage = "splash" | "auth" | "app";

export default function App() {
  const [stage, setStage] = useState<Stage>("splash");
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [memories, setMemories] = useState<MemoryTicket[]>([]);
  const [openMemory, setOpenMemory] = useState<MemoryTicket | null>(null);
  const [showMoodAnalytics, setShowMoodAnalytics] = useState(false);
  const [showMemoryMap, setShowMemoryMap] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryTicket | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Boot
  useEffect(() => { ensureSeed().catch(console.error); }, []);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const m = await getMemories();
      setMemories(m);
    } finally {
      setIsLoading(false);
    }
  };

  const hydrateSession = async () => {
    setIsLoading(true);
    try {
      const s = await getSession();
      if (!s) return false;
      const users = await getUsers();
      const u = users.find(x => x.id === s.userId);
      if (!u) return false;
      setUser(u);
      await refresh(); // refresh sets isLoading internally
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const finishSplash = async () => {
    if (await hydrateSession()) setStage("app");
    else setStage("auth");
  };

  const onAuthed = async () => {
    await hydrateSession();
    setStage("app");
    setTab("home");
  };

  const logout = async () => {
    await setSession(null);
    setUser(null);
    setStage("auth");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const onBackup = async () => {
    const [users, memories] = await Promise.all([getUsers(), getMemories()]);
    const data = { users, memories, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `memory-ticket-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Backup downloaded");
  };

  const onRestore = () => showToast("Restore — pick a backup file (coming soon)");

  const onClearAll = async () => {
    if (confirm("Delete every memory in your vault? This cannot be undone.")) {
      await clearAllMemories();
      await refresh();
      showToast("Vault cleared");
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="relative flex min-h-screen w-full items-stretch justify-center bg-aurora p-0 sm:p-6 lg:p-10">
      {/* Desktop ambient art */}
      <DesktopArt />

      {/* Phone frame */}
      <div className="phone-frame relative z-10 mx-auto flex h-screen w-full max-w-[440px] flex-col overflow-hidden bg-[#09090f] sm:h-[860px] sm:rounded-[44px] sm:border sm:border-white/8">
        <ScreenContent
          stage={stage}
          user={user}
          tab={tab}
          memories={memories}
          openMemory={openMemory}
          editingMemory={editingMemory}
          showMoodAnalytics={showMoodAnalytics}
          showMemoryMap={showMemoryMap}
          isLoading={isLoading}
          finishSplash={finishSplash}
          onAuthed={onAuthed}
          setTab={setTab}
          setOpenMemory={setOpenMemory}
          setShowMoodAnalytics={setShowMoodAnalytics}
          setShowMemoryMap={setShowMemoryMap}
          setEditingMemory={setEditingMemory}
          refresh={refresh}
          onLogout={logout}
          onClearAll={onClearAll}
          onBackup={onBackup}
          onRestore={onRestore}
        />

        {/* Bottom nav appears in app stage and not on add or edit screens */}
        {stage === "app" && !editingMemory && !showMemoryMap && (
          <BottomNav
            active={tab}
            onChange={(t) => { setOpenMemory(null); setTab(t); }}
          />
        )}

        {/* Toast */}
        {toast && (
          <div className="pointer-events-none fixed left-1/2 top-6 z-50 -translate-x-1/2 animate-fade-up rounded-full border border-white/10 bg-[#171722]/90 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

function ScreenContent(props: {
  stage: Stage;
  user: User | null;
  tab: Tab;
  memories: MemoryTicket[];
  openMemory: MemoryTicket | null;
  editingMemory: MemoryTicket | null;
  showMoodAnalytics: boolean;
  showMemoryMap: boolean;
  isLoading: boolean;
  finishSplash: () => void;
  onAuthed: () => void;
  setTab: (t: Tab) => void;
  setOpenMemory: (m: MemoryTicket | null) => void;
  setShowMoodAnalytics: (v: boolean) => void;
  setShowMemoryMap: (v: boolean) => void;
  setEditingMemory: (m: MemoryTicket | null) => void;
  refresh: () => void;
  onLogout: () => void;
  onClearAll: () => void;
  onBackup: () => void;
  onRestore: () => void;
}) {
  const {
    stage, user, tab, memories, openMemory, editingMemory, showMoodAnalytics, showMemoryMap, isLoading,
    finishSplash, onAuthed, setTab, setOpenMemory, setShowMoodAnalytics, setShowMemoryMap, setEditingMemory,
    refresh, onLogout, onClearAll, onBackup, onRestore,
  } = props;

  if (stage === "splash") return <Splash onDone={finishSplash} />;
  if (stage === "auth" || !user) return <Auth onAuthed={onAuthed} />;

  // Mood analytics overlay
  const moodOverlay = showMoodAnalytics && (
    <ErrorBoundary>
      <MoodAnalytics
        memories={memories}
        isLoading={isLoading}
        onClose={() => setShowMoodAnalytics(false)}
      />
    </ErrorBoundary>
  );

  // Memory map overlay
  const mapOverlay = showMemoryMap && (
    <ErrorBoundary>
      <MemoryMap
        memories={memories}
        onOpenMemory={(m) => { setOpenMemory(m); setShowMemoryMap(false); }}
        onClose={() => setShowMemoryMap(false)}
      />
    </ErrorBoundary>
  );

  // Edit memory overlay
  const editOverlay = editingMemory && (
    <div className="fixed inset-0 z-40 animate-fade-in overflow-y-auto bg-[#09090f]">
      <ErrorBoundary key={editingMemory.id}>
        <AddMemory
          editMemory={editingMemory}
          onSaved={async () => {
            await refresh();
            setEditingMemory(null);
          }}
          onCancel={() => setEditingMemory(null)}
        />
      </ErrorBoundary>
    </div>
  );

  // Memory details overlay
  const detailsOverlay = openMemory && (
    <ErrorBoundary key={openMemory.id}>
      <MemoryDetails
        memory={openMemory}
        onClose={() => setOpenMemory(null)}
        onEdit={() => {
          setOpenMemory(null);
          // small delay so the details overlay unmounts cleanly
          setTimeout(() => setEditingMemory(openMemory), 50);
        }}
        onFav={async () => { await toggleFavorite(openMemory.id); await refresh(); setOpenMemory({ ...openMemory, favorite: !openMemory.favorite }); }}
        onDelete={async () => {
          if (confirm("Delete this memory ticket?")) {
            await deleteMemory(openMemory.id);
            await refresh();
            setOpenMemory(null);
          }
        }}
      />
    </ErrorBoundary>
  );

  let body: React.ReactNode = null;
  switch (tab) {
    case "home":
      body = (
        <ErrorBoundary>
          <Home user={user} onTab={setTab} onOpenMoodAnalytics={() => setShowMoodAnalytics(true)} />
        </ErrorBoundary>
      ); break;
    case "gallery":
      body = (
        <ErrorBoundary>
          <Gallery memories={memories} isLoading={isLoading} onOpen={setOpenMemory} onFav={async (id) => { await toggleFavorite(id); await refresh(); }} onAdd={() => setTab("add")} />
        </ErrorBoundary>
      ); break;
    case "add":
      body = (
        <ErrorBoundary>
          <AddMemory onSaved={async () => { await refresh(); setTab("gallery"); }} onCancel={() => setTab("home")} />
        </ErrorBoundary>
      ); break;
    case "timeline":
      body = (
        <ErrorBoundary>
          <Timeline memories={memories} isLoading={isLoading} onOpen={setOpenMemory} />
        </ErrorBoundary>
      ); break;
    case "profile":
      body = (
        <ErrorBoundary>
          <Profile
            user={user}
            memories={memories}
            isLoading={isLoading}
            onLogout={onLogout}
            onClear={onClearAll}
            onBackup={onBackup}
            onRestore={onRestore}
            onOpenMoodAnalytics={() => setShowMoodAnalytics(true)}
            onOpenMemoryMap={() => setShowMemoryMap(true)}
          />
        </ErrorBoundary>
      ); break;
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {body}
      {detailsOverlay}
      {editOverlay}
      {moodOverlay}
      {mapOverlay}
    </div>
  );
}

function DesktopArt() {
  return (
    <div className="pointer-events-none fixed inset-0 hidden lg:block">
      <div className="absolute left-12 top-1/4 text-white/50">
        <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">Memory Ticket Studio</div>
        <h2 className="mt-2 max-w-xs text-3xl font-extrabold leading-tight">
          Every memory <br /><span className="text-gradient">deserves a ticket.</span>
        </h2>
        <p className="mt-3 max-w-xs text-sm text-white/45">
          A cinematic, offline-first memory vault. Built for phones, beautiful on any screen.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-[11px]">
          {["Offline ready", "SQLite", "Dark mode", "Glassmorphism", "QR tickets", "Web first"].map(x => (
            <span key={x} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-white/65 backdrop-blur-sm">{x}</span>
          ))}
        </div>
      </div>
      <div className="absolute right-12 top-1/3 max-w-xs text-right text-white/40">
        <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">Interactive prototype</div>
        <p className="mt-2 text-sm">
          This is the web preview of the Memory Ticket app. Try the splash, sign in as guest, add a memory, and explore the timeline.
        </p>
      </div>
    </div>
  );
}
