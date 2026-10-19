// Client-side OCR for HAKI AI (tesseract.js).
//
// Text extraction runs entirely in the user's browser — no image is ever
// uploaded to a HAKI AI server. The tesseract worker and English language
// data are fetched from a CDN at runtime (see tesseract.js browser
// defaults), so OCR requires an internet connection but no API key.
//
// OCR output is machine text from a photo or scan: accuracy depends on
// image quality, and extracted text must be reviewed by the user before
// any reliance.

export interface OcrProgress {
  status: string;
  progress: number; // 0..1
}

/**
 * Re-encode a picked image through a canvas so Tesseract receives clean PNG
 * bytes. This sidesteps Tesseract's in-worker file sniffing (which misreads
 * some JPEGs as BMP and throws "Error attempting to read image"), and it
 * also downsizes very large photos before the 2 MB WASM heap.
 */
async function toPngBlob(file: File): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () =>
        reject(
          new Error(
            "This file could not be opened as an image. Use a JPEG, PNG, WebP, or BMP photo of the document."
          )
        );
      el.src = objectUrl;
    });

    const maxSide = 3000;
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Failed to encode the image.")),
        "image/png"
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function extractTextFromImage(
  file: File,
  onProgress?: (update: OcrProgress) => void
): Promise<string> {
  const png = await toPngBlob(file);
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (message: { status: string; progress: number }) => {
      onProgress?.({ status: message.status, progress: message.progress });
    },
  });
  try {
    const { data } = await worker.recognize(png);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
