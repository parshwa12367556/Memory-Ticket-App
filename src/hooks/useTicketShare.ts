import { captureTicketCanvas } from "../utils/capture";
import type { MemoryTicket } from "../types";

/** Shared hook for sharing a ticket image via the Web Share API (fallback: download). */
export function useTicketShare() {
  const shareImage = async (
    element: HTMLElement,
    memory: MemoryTicket,
    showToast: (msg: string) => void,
  ) => {
    const canvas = await captureTicketCanvas(element);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const fileName = `ticket-${memory.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: memory.title,
            text: `🎟️ ${memory.title} — ${memory.location}`,
          });
          showToast("✅ Ticket shared!");
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
        }
      }

      const link = document.createElement("a");
      link.download = fileName;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      showToast("✅ Ticket saved (sharing not available)");
    });
  };

  return { shareImage };
}
