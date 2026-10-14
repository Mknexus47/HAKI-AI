// Shared HAKI AI brand-logo loader for generated documents (PDF + DOCX).
//
// The logo is a fixed public asset (public/logo-icon.jpg). It is fetched at
// runtime and cached, so every generator shares one network request and
// documents keep working offline/fail-safe: if the fetch ever fails, the
// document is generated without a logo instead of failing the download.

export interface BrandLogo {
  /** Raw baseline-JPEG bytes. */
  data: Uint8Array;
  /** Image width in pixels (parsed from the JPEG SOF marker). */
  width: number;
  /** Image height in pixels (parsed from the JPEG SOF marker). */
  height: number;
  /** Colour components (1 = gray, 3 = RGB). */
  components: number;
}

export const BRAND_LOGO_URL = "/logo-icon.jpg";

/** Parse width/height/components from a baseline/progressive JPEG. Null if invalid. */
export function parseJpegDimensions(data: Uint8Array): {
  width: number;
  height: number;
  components: number;
} | null {
  if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) return null;
  let pos = 2;
  while (pos + 3 < data.length) {
    if (data[pos] !== 0xff) {
      pos += 1;
      continue;
    }
    const marker = data[pos + 1];
    pos += 2;
    // Stand-alone markers: SOI/ EOI/RSTn/TEM (no length field).
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      continue;
    }
    if (pos + 1 >= data.length) return null;
    const length = (data[pos] << 8) | data[pos + 1];
    if (length < 2) return null;
    // SOF0..SOF3 carry: precision(1) height(2) width(2) components(1).
    if ((marker >= 0xc0 && marker <= 0xc3) && pos + 8 < data.length) {
      const height = (data[pos + 3] << 8) | data[pos + 4];
      const width = (data[pos + 5] << 8) | data[pos + 6];
      const components = data[pos + 7];
      if (width > 0 && height > 0) return { width, height, components };
      return null;
    }
    pos += length;
  }
  return null;
}

async function fetchBrandLogo(): Promise<BrandLogo | null> {
  try {
    const response = await fetch(BRAND_LOGO_URL);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    const data = new Uint8Array(buffer);
    const dims = parseJpegDimensions(data);
    if (!dims) return null;
    return { data, width: dims.width, height: dims.height, components: dims.components };
  } catch {
    return null;
  }
}

let cachedLogo: Promise<BrandLogo | null> | null = null;

/** Warm the logo cache (fire-and-forget on module import in the browser). */
function ensurePreload(): void {
  if (cachedLogo || typeof window === "undefined") return;
  cachedLogo = fetchBrandLogo();
}

/** Resolve the brand logo (cached after the first call). Never throws. */
export function getBrandLogo(): Promise<BrandLogo | null> {
  if (!cachedLogo) cachedLogo = fetchBrandLogo();
  return cachedLogo;
}

ensurePreload();
