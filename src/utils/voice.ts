/**
 * Voice recording utility using the browser MediaRecorder API.
 */

export interface VoiceRecordingResult {
  /** Base64-encoded WebP audio data URL */
  dataUrl: string;
  /** Duration in seconds */
  duration: number;
  /** Blob for waveform analysis */
  blob: Blob;
}

/**
 * Check if voice recording is supported in this browser.
 */
export function isVoiceSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    !!navigator.mediaDevices.getUserMedia &&
    typeof MediaRecorder !== "undefined"
  );
}

/**
 * Request microphone permission and start recording.
 * Returns a promise that resolves with the recording result when stopped.
 */
export async function startRecording(): Promise<{
  stop: () => Promise<VoiceRecordingResult>;
  getAnalyserNode: () => AnalyserNode | null;
}> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // Use the best available audio format
  const mimeType = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ].find(type => MediaRecorder.isTypeSupported(type)) ?? "";

  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: Blob[] = [];
  const startTime = Date.now();

  // Audio context for waveform analysis
  const audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start(100); // Collect data every 100ms for waveform

  const stopPromise = new Promise<VoiceRecordingResult>((resolve, reject) => {
    recorder.onstop = async () => {
      // Stop all tracks
      stream.getTracks().forEach(t => t.stop());
      await audioCtx.close();

      const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
      const duration = (Date.now() - startTime) / 1000;

      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          duration,
          blob,
        });
      };
      reader.onerror = () => reject(new Error("Failed to encode recording"));
      reader.readAsDataURL(blob);
    };
  });

  return {
    stop: () => {
      recorder.stop();
      return stopPromise;
    },
    getAnalyserNode: () => analyser,
  };
}

/**
 * Format seconds into mm:ss display.
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
