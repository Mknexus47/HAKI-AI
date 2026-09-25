// Dependency-free PDF writer, print-optimised for Kenyan legal templates:
// A4 margins, bold headings, centred title, justified body text, watermark,
// and a footer (template name + disclaimer + page number) on EVERY page.

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

function positionLines(items: LayoutLine[]): PositionedLine[][] {
  const pages: PositionedLine[][] = [];
  let page: PositionedLine[] = [];
  let y = PAGE_H - MARGIN_TOP;

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
  const natural = textWidth(line.text, BODY_SIZE);
  const gap = Math.max(0, (CONTENT_W - natural) / (words.length - 1));
  let x = line.x;
  const parts: string[] = [];
  words.forEach((word, index) => {
    const escaped = escapePdfText(word);
    parts.push(
      `1 0 0 1 ${x.toFixed(2)} ${line.y.toFixed(2)} Tm (${escaped}) Tj`
    );
    x += textWidth(word, BODY_SIZE) + gap;
  });
  return parts.join("\n");
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

export function buildPdf(paragraphs: string[], options?: PdfOptions): string {
  const layoutItems = layoutParagraphs(paragraphs, options);
  const pages = positionLines(layoutItems);
  const pageCount = pages.length;

  const objects: string[] = [];
  const firstPageObject = 5;
  const kids = pages
    .map((_, index) => `${firstPageObject + index * 2} 0 R`)
    .join(" ");

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>`;
  objects[3] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[4] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  pages.forEach((pageLines, index) => {
    const pageObj = firstPageObject + index * 2;
    const contentObj = pageObj + 1;
    objects[pageObj] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObj} 0 R >>`;

    const parts: string[] = [drawWatermark()];

    for (const line of pageLines) {
      if (line.kind === "title") {
        parts.push(
          `0 g\nBT /F2 ${TITLE_SIZE} Tf 1 0 0 1 ${line.x.toFixed(2)} ${line.y.toFixed(2)} Tm (${escapePdfText(
            line.text
          )}) Tj ET`
        );
      } else if (line.kind === "heading") {
        parts.push(
          `0 g\nBT /F2 ${HEADING_SIZE} Tf 1 0 0 1 ${line.x.toFixed(2)} ${line.y.toFixed(2)} Tm (${escapePdfText(
            line.text
          )}) Tj ET`
        );
      } else {
        // Justified body text (single BT block, absolute per-word positions).
        parts.push(
          `0 g\nBT /F1 ${BODY_SIZE} Tf\n${drawJustifiedLine(line)}\nET`
        );
      }
    }

    parts.push(drawFooter(index + 1, pageCount));

    const stream = parts.join("\n");
    objects[contentObj] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let i = 1; i < objects.length; i++) {
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  const count = objects.length;
  pdf += `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (let i = 1; i < count; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return pdf;
}

export function downloadPdf(
  filename: string,
  paragraphs: string[],
  options?: PdfOptions
): void {
  const pdf = buildPdf(paragraphs, options);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
