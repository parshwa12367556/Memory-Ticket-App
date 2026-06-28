import html2canvas from "html2canvas";

/** Captures a ticket element and returns an HTMLCanvasElement. */
export async function captureTicketCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    backgroundColor: "#171722",
    scale: 3,
    useCORS: true,
  });
}
