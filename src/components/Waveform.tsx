import { useEffect, useRef } from "react";

interface WaveformProps {
  /**
   * AnalyserNode for live recording visualization.
   * Provide either this OR bars for playback visualization.
   */
  analyser?: AnalyserNode | null;
  /**
   * Pre-computed bar heights (0-1) for playback/static visualization.
   * Provide either this OR analyser for live visualization.
   */
  bars?: number[];
  /**
   * Color of the waveform bars.
   */
  color?: string;
  /**
   * Height of the waveform in pixels.
   */
  height?: number;
  /**
   * Whether the waveform is active (recording or playing).
   */
  active?: boolean;
}

/**
 * Canvas-based audio waveform visualization.
 * Supports both live recording (via AnalyserNode) and playback (via pre-computed bars).
 */
export function Waveform({
  analyser,
  bars: propBars,
  color = "#8a4fff",
  height = 48,
  active = false,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const barCount = 48;
    const isLive = !!analyser;

    const draw = () => {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      let amplitudes: number[];

      if (isLive && analyser) {
        // Live recording — read from AnalyserNode
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        // Downsample to barCount
        const step = Math.floor(dataArray.length / barCount);
        amplitudes = Array.from({ length: barCount }, (_, i) => {
          const idx = i * step;
          const sum = dataArray.slice(idx, idx + step).reduce((a, b) => a + b, 0);
          const avg = sum / step;
          return avg / 255; // normalize to 0-1
        });
      } else if (propBars) {
        // Playback — use pre-computed bars
        amplitudes = propBars;
      } else {
        // Idle — flat line
        amplitudes = Array(barCount).fill(0.05);
      }

      const barWidth = (w - barCount * 2) / barCount;
      const centerY = h / 2;

      for (let i = 0; i < barCount; i++) {
        const amp = Math.max(0.02, amplitudes[i] ?? 0.02);
        const barHeight = Math.max(2, amp * (h - 4));
        const x = i * (barWidth + 2);
        const y = centerY - barHeight / 2;

        // Gradient from top to bottom
        const gradient = ctx!.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, `${color}66`);
        ctx!.fillStyle = gradient;

        // Rounded bars
        const radius = Math.min(barWidth / 2, 3);
        ctx!.beginPath();
        ctx!.roundRect(x, y, barWidth, barHeight, radius);
        ctx!.fill();
      }

      if (active) {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    if (active) {
      draw();
    } else {
      // Draw static frame
      draw();
    }

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [analyser, propBars, color, height, active]);

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={height}
      className="w-full rounded-lg"
      style={{ maxWidth: "100%", height }}
    />
  );
}
