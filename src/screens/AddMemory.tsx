import React, { useEffect, useMemo, useState } from "react";
import { Ticket } from "../components/Ticket";
import { MOODS, TICKET_THEMES, type MemoryTicket, type Mood, type TicketTheme } from "../types";
import { generateCaption } from "../utils/captions";
import { compressImage } from "../utils/compressImage";
import { geocodeLocation } from "../utils/geocode";
import { saveMemory } from "../storage";
import { VoiceRecorder } from "../components/VoiceRecorder";
import { cn } from "../utils/cn";
import type { VoiceRecordingResult } from "../utils/voice";

const STOCK_SAMPLES = [
  "https://images.pexels.com/photos/13230800/pexels-photo-13230800.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  "https://images.pexels.com/photos/5536965/pexels-photo-5536965.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  "https://images.pexels.com/photos/28558415/pexels-photo-28558415.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  "https://images.pexels.com/photos/4880336/pexels-photo-4880336.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  "https://images.pexels.com/photos/15171896/pexels-photo-15171896.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  "https://images.pexels.com/photos/26447525/pexels-photo-26447525.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
];

export function AddMemory({ onSaved, onCancel, editMemory }: { onSaved: () => void; onCancel: () => void; editMemory?: MemoryTicket }) {
  const isEditing = !!editMemory;

  const [title, setTitle] = useState(editMemory?.title ?? "");
  const [location, setLocation] = useState(editMemory?.location ?? "");
  const [story, setStory] = useState(editMemory?.description ?? "");
  const [mood, setMood] = useState<Mood>(editMemory?.mood ?? "Joyful");
  const [theme, setTheme] = useState<TicketTheme>(editMemory?.theme ?? "cinematic");
  const [imageUrl, setImageUrl] = useState<string>(editMemory?.imageUrl ?? STOCK_SAMPLES[0]);
  const [caption, setCaption] = useState(editMemory?.caption ?? "");
  const [tags, setTags] = useState(editMemory?.tags.map(t => t.replace(/^#/, "").trim()).join(", ") ?? "");
  const [confetti, setConfetti] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [compressInfo, setCompressInfo] = useState<{ originalKB: number; compressedKB: number; savedPercent: number } | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [voiceData, setVoiceData] = useState<string | undefined>(editMemory?.voiceData);
  const [voiceDuration, setVoiceDuration] = useState<number | undefined>(editMemory?.voiceDuration);
  const [latitude, setLatitude] = useState<number | undefined>(editMemory?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(editMemory?.longitude);

  // Regenerate caption on mood change (but not on initial edit mount)
  useEffect(() => {
    if (!editMemory) setCaption(generateCaption(mood, location, title));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood]);

  const preview: MemoryTicket = useMemo(() => ({
    id: "preview",
    title: title || "Your memory title",
    description: story || "Your story will live here…",
    location: location || "Somewhere worth remembering",
    mood,
    imageUrl,
    caption: caption || generateCaption(mood, location, title),
    theme,
    favorite: editMemory?.favorite ?? false,
    createdAt: editMemory?.createdAt ?? new Date().toISOString(),
    tags: tags.split(/[, ]+/).filter(Boolean).map(t => t.startsWith("#") ? t : `#${t}`),
    voiceData,
    voiceDuration,
    latitude,
    longitude,
  }), [title, story, location, mood, imageUrl, caption, theme, tags, editMemory, voiceData, voiceDuration, latitude, longitude]);

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { setErr("Please choose an image file."); return; }
    setCompressing(true);
    setErr(null);
    setCompressInfo(null);
    try {
      const result = await compressImage(f);
      setImageUrl(result.dataUrl);
      setCompressInfo({
        originalKB: result.originalSizeKB,
        compressedKB: result.compressedSizeKB,
        savedPercent: result.savedPercent,
      });
    } catch (err) {
      console.warn("Image compression failed, using original:", err);
      // Fallback: read the file without compression
      const reader = new FileReader();
      reader.onload = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(f);
    } finally {
      setCompressing(false);
    }
  };

  const handleSave = async () => {
    setErr(null);
    if (!title.trim()) { setErr("Give your ticket a title."); return; }
    if (!imageUrl) { setErr("Add a photo for your ticket."); return; }

    // Auto-geocode if location is set but no coordinates yet
    let lat = latitude;
    let lng = longitude;
    if (location && lat == null && lng == null && !isEditing) {
      try {
        const geo = await geocodeLocation(location);
        if (geo) {
          lat = geo.lat;
          lng = geo.lng;
          setLatitude(lat);
          setLongitude(lng);
        }
      } catch {
        // Geocoding failed silently — not critical
      }
    }

    const m: MemoryTicket = {
      ...preview,
      id: editMemory?.id ?? crypto.randomUUID(),
      createdAt: editMemory?.createdAt ?? new Date().toISOString(),
      favorite: editMemory?.favorite ?? false,
      voiceData,
      voiceDuration,
      latitude: lat,
      longitude: lng,
    };
    saveMemory(m);
    setConfetti(true);
    setTimeout(() => { setConfetti(false); onSaved(); }, 1100);
  };

  return (
    <div className="relative pb-28">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#09090f]/85 px-5 py-4 backdrop-blur-xl">
        <button onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/80">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className="text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">{isEditing ? "Edit" : "New"}</div>
          <div className="-mt-0.5 text-base font-bold">Memory Ticket</div>
        </div>
        <button onClick={handleSave} className="rounded-xl bg-gradient-purple px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-900/40 transition active:scale-95">
          {isEditing ? "Update" : "Save"}
        </button>
      </header>

      {/* Live preview */}
      <section className="px-6 pt-6">
        <div className="mx-auto max-w-[240px]">
          <Ticket memory={preview} variant="preview" />
        </div>
        <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-white/35">Live preview</p>
      </section>

      {/* Form */}
      <section className="mt-6 space-y-5 px-5">
        {/* Image picker */}
        <div>
          <Label>Photo</Label>
          <div className="grid grid-cols-3 gap-2">
            <label className="relative grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.03] text-center text-[11px] text-white/55 transition hover:border-[var(--color-purple)] hover:text-white">
              <input type="file" accept="image/*" onChange={onPickFile} className="hidden" />
              {compressing ? (
                <div className="flex flex-col items-center gap-1">
                  <svg className="animate-spin h-4 w-4 text-white/60" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                  </svg>
                  <span>Compressing…</span>
                </div>
              ) : (
                <div>
                  <div className="text-xl">＋</div>
                  Upload
                </div>
              )}
            </label>
            {STOCK_SAMPLES.map(src => (
              <button
                key={src}
                onClick={() => setImageUrl(src)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-2xl border-2 transition",
                  imageUrl === src ? "border-[var(--color-purple)] ring-4 ring-purple-500/20" : "border-transparent hover:border-white/20"
                )}
              >
                <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
          {compressInfo && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] text-emerald-200">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>
                Compressed: <strong>{compressInfo.originalKB} KB</strong> → <strong>{compressInfo.compressedKB} KB</strong>
                <span className="text-emerald-300/70"> (saved {compressInfo.savedPercent}%)</span>
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Golden hour at the harbour" />
        </div>

        {/* Location */}
        <div>
          <Label>Location</Label>
          <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Lisbon, Portugal" />
        </div>

        {/* Mood */}
        <div>
          <Label>Mood</Label>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {MOODS.map(m => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-semibold transition",
                  mood === m.id
                    ? "border-transparent bg-gradient-purple text-white shadow-md shadow-purple-900/30"
                    : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]"
                )}
              >
                <span className="text-base">{m.emoji}</span>{m.id}
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <Label>Ticket theme</Label>
          <div className="grid grid-cols-3 gap-2">
            {TICKET_THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "relative overflow-hidden rounded-2xl border p-3 text-left transition",
                  theme === t.id ? "border-[var(--color-purple)] bg-white/[0.06]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                )}
              >
                <div className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${t.gradient}`} />
                <div className="mt-2 text-base">{t.emoji}</div>
                <div className="text-[11px] font-semibold">{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Story */}
        <div>
          <Label>Story</Label>
          <textarea
            value={story}
            onChange={e => setStory(e.target.value)}
            placeholder="Write what you want to remember — the sounds, the smells, the people…"
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-[var(--color-purple)] focus:bg-white/[0.07] focus:ring-4 focus:ring-purple-500/15"
          />
        </div>

        {/* Caption */}
        <div>
          <div className="flex items-center justify-between">
            <Label>Cinematic caption</Label>
            <button
              onClick={() => setCaption(generateCaption(mood, location, title))}
              className="text-[11px] font-semibold text-[var(--color-lavender)] hover:text-white"
            >
              ✨ Regenerate
            </button>
          </div>
          <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="A cinematic line for your memory" />
        </div>

        {/* Tags */}
        <div>
          <Label>Tags <span className="text-white/30">(comma separated)</span></Label>
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="travel, sunset, lisbon" />
        </div>

        {/* Voice Note */}
        <div>
          <VoiceRecorder
            existingDataUrl={editMemory?.voiceData}
            existingDuration={editMemory?.voiceDuration}
            onRecordingComplete={(result: VoiceRecordingResult) => {
              setVoiceData(result.dataUrl);
              setVoiceDuration(result.duration);
            }}
            onClear={() => {
              setVoiceData(undefined);
              setVoiceDuration(undefined);
            }}
          />
        </div>

        {err && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{err}</div>
        )}

        <button
          onClick={handleSave}
          className="w-full rounded-2xl bg-gradient-purple py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-purple-900/40 transition active:scale-[0.98]"
        >
          🎟️  Save Memory Ticket
        </button>
      </section>

      {/* Confetti */}
      {confetti && (
        <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative animate-scale-in rounded-3xl border border-white/10 bg-[#171722] px-8 py-7 text-center shadow-2xl shadow-purple-900/40">
            <div className="text-5xl">{isEditing ? "✏️" : "🎉"}</div>
            <div className="mt-2 text-lg font-bold">{isEditing ? "Updated!" : "Saved!"}</div>
            <div className="text-[12px] text-white/55">{isEditing ? "Your ticket has been updated." : "Your ticket is in the vault."}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/50">{children}</div>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-[var(--color-purple)] focus:bg-white/[0.07] focus:ring-4 focus:ring-purple-500/15"
    />
  );
}
