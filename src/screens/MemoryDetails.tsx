import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { MOODS, TICKET_THEMES, type MemoryTicket } from "../types";
import { Ticket } from "../components/Ticket";
import { useTicketDownload } from "../hooks/useTicketDownload";
import { useTicketShare } from "../hooks/useTicketShare";
import { useToast } from "../hooks/useToast";
import { Waveform } from "../components/Waveform";
import { formatDuration } from "../utils/voice";

interface Props {
  memory: MemoryTicket;
  onClose: () => void;
  onDelete: () => void;
  onFav: () => void;
  onEdit: () => void;
}

export function MemoryDetails({ memory, onClose, onDelete, onFav, onEdit }: Props) {
  const theme = TICKET_THEMES.find(t => t.id === memory.theme) ?? TICKET_THEMES[0];
  const moodMeta = MOODS.find(m => m.id === memory.mood);
  const date = new Date(memory.createdAt);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [processing, setProcessing] = useState(false);
  const { downloadTicket } = useTicketDownload();
  const { shareImage } = useTicketShare();
  const { showToast, ToastUI } = useToast();

  const onDownload = async () => {
    if (!ticketRef.current) return;
    setProcessing(true);
    await downloadTicket(ticketRef.current, memory.title);
    setProcessing(false);
    showToast("✅ Ticket downloaded!");
  };

  const onShareImage = async () => {
    if (!ticketRef.current || processing) return;
    setProcessing(true);
    await shareImage(ticketRef.current, memory, showToast);
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex animate-fade-in flex-col overflow-y-auto bg-[#09090f]">
      {/* Hero image */}
      <div className="relative h-[55%] min-h-[360px] w-full overflow-hidden">
        <img src={memory.imageUrl} alt={memory.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#09090f]" />

        {/* Top bar */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-5">
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className="flex gap-2">
            <button onClick={onFav} className={`grid h-10 w-10 place-items-center rounded-xl backdrop-blur-md transition ${memory.favorite ? "bg-rose-500/90 text-white" : "bg-black/40 text-white hover:bg-black/60"}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={memory.favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button onClick={onShareImage} disabled={processing} className="grid h-10 w-10 place-items-center rounded-xl bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 disabled:opacity-40">
              {processing ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Theme stub */}
        <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${theme.gradient}`} />
          <span className="text-[11px] font-semibold uppercase tracking-wider">{theme.emoji} {theme.label}</span>
        </div>
      </div>

      {/* Body */}
      <div className="relative -mt-12 flex-1 rounded-t-[32px] border-t border-white/5 bg-[#0e0e18] px-5 pb-32 pt-6">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />

        <h1 className="text-2xl font-extrabold leading-tight">{memory.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-white/60">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {memory.location}
          </span>
          <span>·</span>
          <span>{date.toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>

        {/* Caption */}
        <blockquote className="mt-5 rounded-2xl border-l-2 border-[var(--color-purple)] bg-white/[0.03] px-4 py-3 text-[13px] italic text-white/85">
          "{memory.caption}"
        </blockquote>

        {/* Story */}
        <section className="mt-6">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/45">The story</h3>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-white/85">{memory.description}</p>
        </section>

        {/* Mood + QR */}
        <section className="mt-6 grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4">
            <div className="text-[10px] uppercase tracking-wider text-white/45">Mood</div>
            <div className="mt-1.5 flex items-center gap-2 text-base font-bold" style={{ color: moodMeta?.color }}>
              <span className="text-xl">{moodMeta?.emoji}</span>{memory.mood}
            </div>
          </div>
          <div className="glass flex flex-col items-center gap-2 rounded-2xl p-4">
            <div className="rounded-lg bg-white p-1.5 shadow-sm">
              <QRCode
                value={`MEMORY TICKET\n${memory.title}\n${memory.location}\n${new Date(memory.createdAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric"})}\nID: ${memory.id.slice(0,8).toUpperCase()}`}
                size={76}
                level="M"
              />
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-white/45">Ticket ID</div>
              <div className="font-mono text-[11px] font-bold text-white/85">#{memory.id.slice(0,8).toUpperCase()}</div>
            </div>
          </div>
        </section>

        {/* Tags */}
        {memory.tags.length > 0 && (
          <section className="mt-5 flex flex-wrap gap-2">
            {memory.tags.map(t => (
              <span key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/70">{t}</span>
            ))}
          </section>
        )}

        {/* Voice Note */}
        {memory.voiceData && (
          <VoicePlayback dataUrl={memory.voiceData} duration={memory.voiceDuration} />
        )}

        {/* Ticket Card Preview */}
        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/45">Ticket Card</h3>
            <span className="text-[10px] text-white/35">Preview</span>
          </div>
          <div ref={ticketRef} className="mx-auto max-w-[220px]">
            <Ticket memory={memory} variant="preview" />
          </div>
        </section>

        {/* Actions */}
        <div className="mt-7 grid grid-cols-4 gap-2">
          <ActionBtn icon="✏️" label="Edit" onClick={onEdit} />
          <ActionBtn icon="⬇️" label="Download" onClick={onDownload} loading={processing} />
          <ActionBtn icon="🔗" label="Share" onClick={onShareImage} loading={processing} />
          <ActionBtn icon="🗑️" label="Delete" onClick={onDelete} danger />
        </div>
        {ToastUI}
      </div>
    </div>
  );
}

/* ── Voice Playback Block ── */
function VoicePlayback({ dataUrl, duration }: { dataUrl: string; duration?: number }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const onPlay = useCallback(() => {
    if (playing) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlaying(false);
      return;
    }
    const audio = new Audio(dataUrl);
    audioRef.current = audio;
    audio.play().catch(console.warn);
    setPlaying(true);

    audio.ontimeupdate = () => {
      setProgress(audio.currentTime / (audio.duration || 1));
    };
    audio.onended = () => {
      setPlaying(false);
      setProgress(0);
      audioRef.current = null;
    };
  }, [dataUrl, playing]);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  // Generate static bars for playback
  const bars = Array.from({ length: 48 }, (_, i) => {
    const t = i / 48;
    const amp = playing ? 0.15 + (Math.sin(t * 12 + progress * 20) * 0.5 + 0.5) * 0.35 : 0.1 + (Math.sin(t * 12) * 0.5 + 0.5) * 0.3;
    return Math.max(0.04, amp);
  });

  return (
    <section className="mt-5">
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎙️</span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">Voice Note</span>
          </div>
          {duration && (
            <span className="font-mono text-[11px] text-white/50">{formatDuration(duration)}</span>
          )}
        </div>
        <Waveform
          bars={bars}
          color={playing ? "#5ea3ff" : "#8a4fff"}
          height={40}
          active={playing}
        />
        <div className="mt-3 flex justify-center">
          <button
            onClick={onPlay}
            className={`grid h-10 w-10 place-items-center rounded-full transition active:scale-90 ${
              playing
                ? "bg-blue-500 text-white shadow-lg shadow-blue-900/40"
                : "bg-gradient-purple text-white shadow-lg shadow-purple-900/40"
            }`}
            title={playing ? "Stop" : "Play voice note"}
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            )}
          </button>
        </div>
        {/* Progress bar */}
        {playing && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8a4fff] to-[#5ea3ff] transition-all duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ActionBtn({ icon, label, onClick, danger, loading }: { icon: string; label: string; onClick: () => void; danger?: boolean; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`glass flex flex-col items-center gap-1 rounded-2xl py-3 text-xs font-semibold transition hover:bg-white/[0.06] disabled:opacity-40 disabled:pointer-events-none ${danger ? "text-rose-300" : "text-white/85"}`}
    >
      {loading ? (
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
        </svg>
      ) : (
        <span className="text-lg">{icon}</span>
      )}
      {label}
    </button>
  );
}


