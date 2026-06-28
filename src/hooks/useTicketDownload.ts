import { useCallback } from "react";
import { captureTicketCanvas } from "../utils/capture";

export function useTicketDownload() {
  const downloadTicket = useCallback(async (element: HTMLElement, title: string) => {
    const canvas = await captureTicketCanvas(element);
    const link = document.createElement("a");
    link.download = `ticket-${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  return { downloadTicket };
}
