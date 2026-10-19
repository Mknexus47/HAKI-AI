// Dependency-free PDF writer, print-optimised for Kenyan legal templates:
// A4 margins, bold headings, centred title, justified body text, watermark,
// centred HAKI AI brand logo above the title (first page), and a footer
// (template name + disclaimer + page number) on EVERY page.

import { getBrandLogo, type BrandLogo } from "./brand-logo";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN_L = 64;
const MARGIN_R = 64;
const MARGIN_TOP = 72;
const BOTTOM_LIMIT = 64; // footer lives below this
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;
const LINE_H = 15.5;
const BODY_SIZE = 11;
const HEADING_SIZE = 12;
const TITLE_SIZE = 15;
const FOOTER_SIZE = 8;

// Brand letterhead: logo drawn centred above the title on page one.
const LOGO_DISPLAY_W = 54;
const LOGO_GAP = 12; // gap between the logo and the top of the title text

// Brand colours (HAKI AI identity, see app/globals.css):
// Haki red #E5342B for the document title, dark gold #A8871F for headings
// (readable on white in print), mid gold #C9A227 for the footer rule.
// Body text stays black so generated instruments remain formal and printable.
const BRAND_RED_FILL = "0.898 0.204 0.169 rg"; // #E5342B
const BRAND_GOLD_DARK_FILL = "0.659 0.529 0.122 rg"; // #A8871F
const BRAND_GOLD_STROKE = "0.788 0.635 0.153 RG"; // #C9A227
const FOOTER_LEFT = "HAKI AI - Legal Information Template";
const FOOTER_DISCLAIMER =
  "General legal information only - not legal advice. Consult a licensed advocate of the High Court of Kenya.";

// Helvetica glyph widths (units per 1000) for ASCII 32..126.
const HELV_REGULAR =
  "278 278 355 556 556 889 667 191 333 333 389 584 278 333 278 278 556 556 556 556 556 556 556 556 556 556 278 278 584 584 584 556 1015 667 667 722 722 667 611 778 722 278 500 667 556 833 722 778 667 778 722 667 611 722 667 944 667 667 611 278 278 278 469 556 333 556 556 500 556 556 278 556 556 222 222 500 222 833 556 556 556 556 333 500 278 556 500 722 500 500 500 334 260 334 584";
const HELV_BOLD =
  "278 333 474 556 556 889 722 238 333 333 389 584 278 333 278 278 556 556 556 556 556 556 556 556 556 556 333 333 584 584 584 611 975 722 722 722 722 667 611 778 722 278 556 722 611 833 722 778 667 778 722 667 611 722 667 944 667 667 611 333 278 333 584 556 333 556 611 556 611 556 333 611 611 278 278 556 278 889 611 611 611 611 389 556 333 611 556 778 556 556 500 389 280 389 584";

function widthTable(source: string): number[] {
  return source.split(" ").map(Number);
}

const REG_WIDTHS = widthTable(HELV_REGULAR);
const BOLD_WIDTHS = widthTable(HELV_BOLD);

function textWidth(text: string, size: number, bold = false): number {
  const table = bold ? BOLD_WIDTHS : REG_WIDTHS;
  let units = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    units += code >= 32 && code <= 126 ? table[code - 32] : 556;
  }
  return (units / 1000) * size;
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "");
}

function wrap(text: string, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (textWidth(`${current} ${word}`, size) <= maxWidth) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

interface LayoutLine {
  text: string;
  kind: "title" | "heading" | "body" | "gap" | "paraEnd";
  isLast?: boolean;
}

interface PositionedLine extends LayoutLine {
  x: number;
  y: number;
  width: number;
}

export interface PdfOptions {
  title?: string;
  /** Baseline-JPEG brand logo (centred above the title on page one). */
  logo?: BrandLogo | null;
}

/** Display height (pt) preserving the logo aspect ratio. */
function logoDisplayHeight(logo: BrandLogo): number {
  return (LOGO_DISPLAY_W * logo.height) / logo.width;
}

function layoutParagraphs(paragraphs: string[], options?: PdfOptions) {
  const lines: LayoutLine[] = [];
  if (options?.title) {
    lines.push({ text: options.title, kind: "title" });
  }
  for (const paragraph of paragraphs) {
    if (paragraph === "") {
      lines.push({ text: "", kind: "gap" });
      continue;
    }
    if (paragraph.startsWith("# ")) {
      const heading = paragraph.slice(2);
      for (const line of wrap(heading, HEADING_SIZE, CONTENT_W)) {
        lines.push({ text: line, kind: "heading" });
      }
      continue;
    }
    const wrapped = wrap(paragraph, BODY_SIZE, CONTENT_W);
    wrapped.forEach((line, index) => {
      lines.push({
        text: line,
        kind: "body",
        isLast: index === wrapped.length - 1,
      });
      if (index === wrapped.length - 1) {
        lines.push({ text: "", kind: "paraEnd" });
      }
    });
  }
  return lines;
}

function positionLines(
  items: LayoutLine[],
  firstPagePad = 0
): PositionedLine[][] {
  const pages: PositionedLine[][] = [];
  let page: PositionedLine[] = [];
  let y = PAGE_H - MARGIN_TOP - firstPagePad;

  const startPage = () => {
    pages.push(page);
    page = [];
    y = PAGE_H - MARGIN_TOP;
  };

  for (const item of items) {
    if (item.kind === "gap") {
      y -= 9;
      continue;
    }
    if (item.kind === "paraEnd") {
      y -= 5;
      continue;
    }
    const size =
      item.kind === "title"
        ? TITLE_SIZE
        : item.kind === "heading"
          ? HEADING_SIZE
          : BODY_SIZE;
    const height = item.kind === "title" ? TITLE_SIZE + 8 : LINE_H + 2;
    if (y - height < BOTTOM_LIMIT && (page.length > 0 || pages.length > 0)) {
      startPage();
    }
    const width = textWidth(
      item.text,
      size,
      item.kind === "title" || item.kind === "heading"
    );
    const x =
      item.kind === "title" ? MARGIN_L + (CONTENT_W - width) / 2 : MARGIN_L;
    page.push({ ...item, x, y, width });
    y -= height;
  }
  if (page.length > 0 || pages.length === 0) pages.push(page);
  return pages;
}

function drawJustifiedLine(line: PositionedLine): string {
  const words = line.text.split(/\s+/).filter(Boolean);
  if (words.length < 2 || line.isLast) {
    // Single word or final line of a paragraph: ragged right, no stretching.
    return `1 0 0 1 ${line.x.toFixed(2)} ${line.y.toFixed(2)} Tm (${escapePdfText(
      line.text
    )}) Tj`;
  }
  // Justified via a TJ array (NOT the Tw word-spacing operator): literal
  // space characters stay inside the strings (copy-paste safe) and the
  // extra stretch is applied as per-gap glyph positioning adjustments.
  // TJ adjustments are honoured by every PDF renderer, while Tw is
  // mishandled by some mobile/minimal viewers (gaps collapse to ~zero
  // width, jamming words together on justified lines).
  const natural = textWidth(line.text, BODY_SIZE);
  const extra = Math.max(0, (CONTENT_W - natural) / (words.length - 1));
  // TJ numbers are thousandths of an em; negative values add space.
  const adjust = (-(extra * 1000) / BODY_SIZE).toFixed(1);
  let tj = `(${escapePdfText(words[0])})`;
  for (let i = 1; i < words.length; i++) {
    tj += ` ${adjust} (${escapePdfText(` ${words[i]}`)})`;
  }
  return `1 0 0 1 ${line.x.toFixed(2)} ${line.y.toFixed(2)} Tm [${tj}] TJ`;
}

function drawFooter(pageNumber: number, pageCount: number): string {
  const y1 = 48;
  const y2 = 36;
  const pageNumText = `Page ${pageNumber} of ${pageCount}`;
  const pageNumWidth = textWidth(pageNumText, FOOTER_SIZE);
  return [
    `0.4 g`,
    `BT /F1 ${FOOTER_SIZE} Tf 1 0 0 1 ${MARGIN_L} ${y1} Tm (${escapePdfText(
      FOOTER_LEFT
    )}) Tj ET`,
    `BT /F1 ${FOOTER_SIZE} Tf 1 0 0 1 ${(PAGE_W - MARGIN_R - pageNumWidth).toFixed(2)} ${y1} Tm (${escapePdfText(
      pageNumText
    )}) Tj ET`,
    `0.5 g`,
    `BT /F1 7 Tf 1 0 0 1 ${MARGIN_L} ${y2} Tm (${escapePdfText(
      FOOTER_DISCLAIMER
    )}) Tj ET`,
    `0.85 g`,
    `${BRAND_GOLD_STROKE}`,
    `0.5 w ${MARGIN_L} ${y1 + 8} m ${PAGE_W - MARGIN_R} ${y1 + 8} l S`,
    ``,
  ].join("\n");
}

function drawWatermark(): string {
  const text = "HAKI AI";
  const size = 64;
  const width = textWidth(text, size);
  const x = (PAGE_W - width) / 2;
  const y = PAGE_H / 2;
  // Diagonal (-30 degrees), very light grey so print stays readable.
  const rad = (-30 * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return `0.93 g\nBT /F1 ${size} Tf ${cos.toFixed(4)} ${sin.toFixed(4)} ${(-sin).toFixed(4)} ${cos.toFixed(4)} ${x.toFixed(2)} ${y.toFixed(2)} Tm (${escapePdfText(text)}) Tj ET`;
}

const encoder = new TextEncoder();

function strBytes(text: string): Uint8Array {
  return encoder.encode(text);
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const chunk of chunks) total += chunk.length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** PDF colour space for the logo JPEG (brand asset is RGB). */
function logoColorSpace(logo: BrandLogo): string | null {
  if (logo.components === 3) return "/DeviceRGB";
  if (logo.components === 1) return "/DeviceGray";
  return null; // e.g. CMYK — skip the logo rather than misrender it
}

export function buildPdf(
  paragraphs: string[],
  options?: PdfOptions
): Uint8Array {
  const logo = options?.logo ?? null;
  const logoSpace = logo ? logoColorSpace(logo) : null;
  const withLogo = logo && logoSpace ? logo : null;
  const logoH = withLogo ? logoDisplayHeight(withLogo) : 0;
  const firstPagePad = withLogo ? logoH + LOGO_GAP + TITLE_SIZE : 0;

  const layoutItems = layoutParagraphs(paragraphs, options);
  const pages = positionLines(layoutItems, firstPagePad);
  const pageCount = pages.length;

  const objects: { head: Uint8Array; body: Uint8Array }[] = [];
  const pushObject = (head: string, body: Uint8Array) => {
    objects.push({ head: strBytes(head), body });
  };
  const firstPageObject = 5;
  const kids = pages
    .map((_, index) => `${firstPageObject + index * 2} 0 R`)
    .join(" ");
  const imageObject = withLogo ? firstPageObject + pageCount * 2 : 0;

  pushObject(
    `${1} 0 obj\n`,
    strBytes("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
  );
  pushObject(
    `${2} 0 obj\n`,
    strBytes(`<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>\nendobj\n`)
  );
  pushObject(
    `${3} 0 obj\n`,
    strBytes(
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n"
    )
  );
  pushObject(
    `${4} 0 obj\n`,
    strBytes(
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n"
    )
  );

  pages.forEach((pageLines, index) => {
    const pageObj = firstPageObject + index * 2;
    const contentObj = pageObj + 1;
    const isFirst = index === 0;
    const resources =
      isFirst && withLogo
        ? `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /ImLogo ${imageObject} 0 R >> >>`
        : `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >>`;
    pushObject(
      `${pageObj} 0 obj\n`,
      strBytes(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}] ` +
          `${resources} /Contents ${contentObj} 0 R >>\nendobj\n`
      )
    );

    const parts: string[] = [drawWatermark()];

    if (isFirst && withLogo) {
      // Centred letterhead logo above the title.
      const x = MARGIN_L + (CONTENT_W - LOGO_DISPLAY_W) / 2;
      const contentTop = PAGE_H - MARGIN_TOP - firstPagePad;
      const yBottom = contentTop + LOGO_GAP + TITLE_SIZE;
      parts.push(
        `q ${LOGO_DISPLAY_W.toFixed(2)} 0 0 ${logoH.toFixed(2)} ${x.toFixed(2)} ${yBottom.toFixed(2)} cm /ImLogo Do Q`
      );
    }

    for (const line of pageLines) {
      if (line.kind === "title") {
        parts.push(
          `${BRAND_RED_FILL}\nBT /F2 ${TITLE_SIZE} Tf 1 0 0 1 ${line.x.toFixed(2)} ${line.y.toFixed(2)} Tm (${escapePdfText(
            line.text
          )}) Tj ET`
        );
      } else if (line.kind === "heading") {
        parts.push(
          `${BRAND_GOLD_DARK_FILL}\nBT /F2 ${HEADING_SIZE} Tf 1 0 0 1 ${line.x.toFixed(2)} ${line.y.toFixed(2)} Tm (${escapePdfText(
            line.text
          )}) Tj ET`
        );
      } else {
        // Justified body text (single BT block, TJ array with spaces kept).
        parts.push(
          `0 g\nBT /F1 ${BODY_SIZE} Tf\n${drawJustifiedLine(line)}\nET`
        );
      }
    }

    parts.push(drawFooter(index + 1, pageCount));

    const stream = parts.join("\n");
    pushObject(
      `${contentObj} 0 obj\n`,
      concatBytes([
        strBytes(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`),
      ])
    );
  });

  if (withLogo && logoSpace) {
    // JPEG bytes embed as-is with DCTDecode; the stream length is exact
    // bytes (never JS string length, which would corrupt binary data).
    pushObject(
      `${imageObject} 0 obj\n`,
      concatBytes([
        strBytes(
          `<< /Type /XObject /Subtype /Image /Width ${withLogo.width} /Height ${withLogo.height} ` +
            `/ColorSpace ${logoSpace} /BitsPerComponent 8 /Filter /DCTDecode /Length ${withLogo.data.length} >>\nstream\n`
        ),
        withLogo.data,
        strBytes("\nendstream\nendobj\n"),
      ])
    );
  }

  const chunks: Uint8Array[] = [strBytes("%PDF-1.4\n")];
  const offsets: number[] = [];
  let cursor = chunks[0].length;
  // Objects were pushed in strict numeric order (1..N).
  objects.forEach((obj, i) => {
    offsets[i + 1] = cursor;
    chunks.push(obj.head, obj.body);
    cursor += obj.head.length + obj.body.length;
  });

  const count = objects.length + 1;
  const xref: string[] = [`xref\n0 ${count}\n0000000000 65535 f \n`];
  for (let i = 1; i < count; i++) {
    xref.push(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  }
  xref.push(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${cursor}\n%%EOF`);
  chunks.push(strBytes(xref.join("")));
  return concatBytes(chunks);
}

export async function downloadPdf(
  filename: string,
  paragraphs: string[],
  options?: PdfOptions
): Promise<void> {
  // Brand letterhead: best-effort — a failed fetch still downloads the PDF.
  let logo: BrandLogo | null = null;
  try {
    logo = await getBrandLogo();
  } catch {
    logo = null;
  }
  const pdf = buildPdf(paragraphs, { ...options, logo });
  // Copy into a fresh ArrayBuffer so the Blob holds exactly these bytes.
  const copy = new Uint8Array(pdf.length);
  copy.set(pdf);
  const blob = new Blob([copy.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
