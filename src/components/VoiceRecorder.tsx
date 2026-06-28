import { useCallback, useEffect, useRef, useState } from "react";
import { Waveform } from "./Waveform";
import { formatDuration, isVoiceSupported, startRecording, type VoiceRecordingResult } from "../utils/voice";
import { cn } from "../utils/cn";

interface VoiceRecorderProps {
  /** Existing voice data URL for editing mode */
  existingDataUrl?: string;
  /** Existing voice duration for editing mode */
  existingDuration?: number;
  /** Called when recording is complete with the result */
  onRecordingComplete: (result: VoiceRecordingResult) => void;
  /** Called to clear an existing recording */
  onClear: () => void;
}

type State = "idle" | "recording" | "recorded" | "playing";

/**
 * Voice recording UI with record button, waveform visualization, and playback.
 */
export function VoiceRecorder({
  existingDataUrl,
  existingDuration,
  onRecordingComplete,
  onClear,
}: VoiceRecorderProps) {
  const [state, setState] = useState<State>(
    existingDataUrl ? "recorded" : "idle"
  );
  const [duration, setDuration] = useState(existingDuration ?? 0);
  const [playProgress, setPlayProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const stopRef = useRef<(() => Promise<VoiceRecordingResult>) | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animRef = useRef<number>(0);
  const [liveBars, setLiveBars] = useState<number[]>([]);

  const supported = isVoiceSupported();

  // Update live bars during recording
  useEffect(() => {
    if (state !== "recording" || !analyserRef.current) return;

    const update = () => {
      if (!analyserRef.current) return;
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(data);

      const barCount = 48;
      const step = Math.floor(data.length / barCount);
      const bars = Array.from({ length: barCount }, (_, i) => {
        const idx = i * step;
        const sum = data.slice(idx, idx + step).reduce((a, b) => a + b, 0);
        return sum / step / 255;
      });
      setLiveBars(bars);
      animRef.current = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animRef.current);
  }, [state]);

  const onStartRecording = useCallback(async () => {
    setError(null);
    try {
      const { stop, getAnalyserNode } = await startRecording();
      analyserRef.current = getAnalyserNode();
      stopRef.current = stop;
      setState("recording");
      setDuration(0);

      // Track duration
      const startTime = Date.now();
      const durInterval = setInterval(() => {
        setDuration((Date.now() - startTime) / 1000);
      }, 200);

      // Store interval for cleanup
      (window as any).__voiceDurInterval = durInterval;
    } catch (err: any) {
      setError(err.message || "Microphone access denied. Please allow microphone permissions.");
    }
  }, []);

  const onStopRecording = useCallback(async () => {
    if (!stopRef.current) return;
    clearInterval((window as any).__voiceDurInterval);
    try {
      const result = await stopRef.current();
      setDuration(result.duration);
      onRecordingComplete(result);
      setState("recorded");
      analyserRef.current = null;
      setLiveBars([]);
    } catch (err: any) {
      setError(err.message || "Failed to stop recording.");
      setState("idle");
    }
  }, [onRecordingComplete]);

  const onPlay = useCallback(() => {
    if (!existingDataUrl) return;
    setState("playing");
    const audio = new Audio(existingDataUrl);
    audioRef.current = audio;

    audio.play().catch(() => {
      setError("Playback failed.");
      setState("recorded");
    });
    audio.onended = () => {
      setState("recorded");
      setPlayProgress(0);
      audioRef.current = null;
    };
    audio.ontimeupdate = () => {
      setPlayProgress(audio.currentTime / (audio.duration || 1));
    };
  }, [existingDataUrl]);

  const onStopPlayback = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setState("recorded");
    setPlayProgress(0);
  }, []);

  const onClearRecording = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setState("idle");
    setDuration(0);
    setPlayProgress(0);
    setLiveBars([]);
    onClear();
  }, [onClear]);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">🎙️</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">
            Voice Note
          </span>
        </div>
        {state !== "idle" && (
          <span className="font-mono text-[11px] text-white/50">
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* Waveform area */}
      <div className="mb-3">
        {state === "recording" ? (
          <Waveform
            bars={liveBars}
            color="#ff4f8a"
            height={48}
            active
          />
        ) : state === "playing" ? (
          <Waveform
            bars={Array.from({ length: 48 }, (_, i) => {
              // Simulate animated bars during playback
              const phase = (i / 48) * Math.PI * 2;
              return 0.15 + Math.sin(phase + playProgress * 10) * 0.15 + Math.random() * 0.1;
            })}
            color="#5ea3ff"
            height={48}
            active
          />
        ) : state === "recorded" ? (
          <Waveform
            bars={Array.from({ length: 48 }, (_, i) => {
              const t = i / 48;
              return 0.1 + (Math.sin(t * 12) * 0.5 + 0.5) * 0.4;
            })}
            color="#8a4fff"
            height={48}
          />
        ) : (
          <Waveform
            bars={Array(48).fill(0.04)}
            color="#ffffff"
            height={48}
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {state === "idle" && (
          <button
            onClick={onStartRecording}
            disabled={!supported}
            className={cn(
              "grid h-12 w-12 place-items-center rounded-full transition active:scale-90",
              supported
                ? "bg-rose-500 text-white shadow-lg shadow-rose-900/40 hover:bg-rose-400"
                : "bg-white/[0.06] text-white/40 cursor-not-allowed"
            )}
            title={supported ? "Start recording" : "Voice recording not supported in this browser"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </button>
        )}

        {state === "recording" && (
          <button
            onClick={onStopRecording}
            className="grid h-12 w-12 place-items-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-900/60 transition active:scale-90 animate-pulse"
            title="Stop recording"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          </button>
        )}

        {state === "recorded" && (
          <>
            <button
              onClick={onClearRecording}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white/60 transition hover:bg-white/[0.1] active:scale-90"
              title="Delete recording"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/></svg>
            </button>
            <button
              onClick={onPlay}
              className="grid h-12 w-12 place-items-center rounded-full bg-gradient-purple text-white shadow-lg shadow-purple-900/40 transition active:scale-90"
              title="Play recording"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
          </>
        )}

        {state === "playing" && (
          <button
            onClick={onStopPlayback}
            className="grid h-12 w-12 place-items-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-900/40 transition active:scale-90"
            title="Stop playback"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          </button>
        )}
      </div>

      {!supported && (
        <p className="mt-3 text-center text-[10px] text-rose-300/70">
          Voice recording is not supported in this browser. Try Chrome or Edge.
        </p>
      )}

      {error && (
        <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[10px] text-rose-200">
          {error}
        </div>
      )}
    </div>
  );
}
