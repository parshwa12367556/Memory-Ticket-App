/**
 * Compress an image to a JPEG data URL at a reduced size.
 *
 * - Resizes the longest side to `maxDimension` while preserving aspect ratio.
 * - Saves as JPEG at `quality` (0–1).
 * - Returns the compressed data URL and size stats.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeKB: number;
  compressedSizeKB: number;
  savedKB: number;
  savedPercent: number;
}

const DEFAULT_MAX_DIMENSION = 1200;
const DEFAULT_QUALITY = 0.82;

function estimateDataUrlKB(dataUrl: string): number {
  // Strip the data URL prefix (e.g. "data:image/jpeg;base64,") for accurate body size
  const comma = dataUrl.indexOf(",");
  const body = comma !== -1 ? dataUrl.substring(comma + 1) : dataUrl;
  // Base64: each character represents ~6 bits = 0.75 bytes
  return Math.round((body.length * 0.75) / 1024 * 10) / 10;
}

export function compressImage(
  fileOrDataUrl: File | string,
  maxDimension = DEFAULT_MAX_DIMENSION,
  quality = DEFAULT_QUALITY,
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    let originalSizeKB: number;

    if (typeof fileOrDataUrl === "string") {
      // Data URL — estimate size from string length
      originalSizeKB = estimateDataUrlKB(fileOrDataUrl);
    } else {
      // File — use file.size
      originalSizeKB = Math.round((fileOrDataUrl.size / 1024) * 10) / 10;
    }

    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create offscreen canvas and draw the scaled image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas 2D context"));
        return;
      }

      // White background (JPEG doesn't support alpha)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      const compressedSizeKB = estimateDataUrlKB(compressedDataUrl);
      const savedKB = Math.round((originalSizeKB - compressedSizeKB) * 10) / 10;
      const savedPercent = originalSizeKB > 0
        ? Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100)
        : 0;

      resolve({
        dataUrl: compressedDataUrl,
        originalSizeKB,
        compressedSizeKB,
        savedKB,
        savedPercent,
      });
    };

    img.onerror = () => reject(new Error("Failed to load image for compression"));

    // Load the source
    if (typeof fileOrDataUrl === "string") {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = () => { img.src = reader.result as string; };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
