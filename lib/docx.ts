// Dependency-free DOCX exporter for HAKI AI grounded documents.
//
// A .docx file is a ZIP package of OOXML parts. To avoid adding archive
// dependencies, this module writes a minimal ZIP with STORED (uncompressed)
// entries: local file headers + central directory. Microsoft Word,
// LibreOffice, and Google Docs all open stored-entry packages.
//
// Reuses the same paragraph convention as lib/pdf.ts: "# " prefixes are
// headings, "" is spacing, everything else is body text.
//
// An optional brand logo (public/logo-icon.jpg) is embedded as
// word/media/logo.jpg with a centred DrawingML paragraph above the title.

import { getBrandLogo, type BrandLogo } from "./brand-logo"

// Display width of the letterhead logo (matches the PDF: 54pt).
const LOGO_DISPLAY_PT = 54;
// EMU per point (914400 EMU = 1 inch = 72pt).
const EMU_PER_PT = 12700;

function crc32Table(): Uint32Array {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let value = i
    for (let j = 0; j < 8; j++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }
    table[i] = value >>> 0
  }
  return table
}

const CRC_TABLE = crc32Table()

function crc32(data: Uint8Array): number {
  let value = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    value = CRC_TABLE[(value ^ data[i]) & 0xff] ^ (value >>> 8)
  }
  return (value ^ 0xffffffff) >>> 0
}

function u16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true)
}

function u32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value, true)
}

// Fixed DOS timestamp (2026-10-12 12:00:00) — deterministic output.
const DOS_TIME = (12 << 11) | (0 << 5) | 0
const DOS_DATE = ((2026 - 1980) << 9) | (10 << 5) | 12

interface ZipEntry {
  name: string
  data: Uint8Array
}

function buildZip(entries: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder()
  const names = entries.map((entry) => encoder.encode(entry.name))
  const localSizes = entries.map((_, i) => 30 + names[i].length)
  const centralSizes = entries.map((_, i) => 46 + names[i].length)

  let localTotal = 0
  for (let i = 0; i < entries.length; i++) {
    localTotal += localSizes[i] + entries[i].data.length
  }
  let centralTotal = 0
  for (const size of centralSizes) centralTotal += size
  const total = localTotal + centralTotal + 22

  const buffer = new ArrayBuffer(total)
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)
  let offset = 0
  const localOffsets: number[] = []

  entries.forEach((entry, i) => {
    localOffsets.push(offset)
    const name = names[i]
    const crc = crc32(entry.data)
    u32(view, offset, 0x04034b50) // local file header signature
    u16(view, offset + 4, 20) // version needed
    u16(view, offset + 6, 0x0800) // UTF-8 filename flag
    u16(view, offset + 8, 0) // stored
    u16(view, offset + 10, DOS_TIME)
    u16(view, offset + 12, DOS_DATE)
    u32(view, offset + 14, crc)
    u32(view, offset + 18, entry.data.length)
    u32(view, offset + 22, entry.data.length)
    u16(view, offset + 26, name.length)
    u16(view, offset + 28, 0) // extra length
    offset += 30
    bytes.set(name, offset)
    offset += name.length
    bytes.set(entry.data, offset)
    offset += entry.data.length
  })

  const centralStart = offset
  entries.forEach((entry, i) => {
    const name = names[i]
    const crc = crc32(entry.data)
    u32(view, offset, 0x02014b50) // central directory signature
    u16(view, offset + 4, 20) // version made by
    u16(view, offset + 6, 20) // version needed
    u16(view, offset + 8, 0x0800)
    u16(view, offset + 10, 0)
    u16(view, offset + 12, DOS_TIME)
    u16(view, offset + 14, DOS_DATE)
    u32(view, offset + 16, crc)
    u32(view, offset + 20, entry.data.length)
    u32(view, offset + 24, entry.data.length)
    u16(view, offset + 28, name.length)
    u16(view, offset + 30, 0)
    u16(view, offset + 32, 0)
    u16(view, offset + 34, 0)
    u16(view, offset + 36, 0)
    u32(view, offset + 38, 0)
    u32(view, offset + 42, localOffsets[i])
    offset += 46
    bytes.set(name, offset)
    offset += name.length
  })

  const centralSize = offset - centralStart
  u32(view, offset, 0x06054b50) // end of central directory
  u16(view, offset + 4, 0)
  u16(view, offset + 6, 0)
  u16(view, offset + 8, entries.length)
  u16(view, offset + 10, entries.length)
  u32(view, offset + 12, centralSize)
  u32(view, offset + 16, centralStart)
  u16(view, offset + 20, 0)

  return bytes
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function paragraphXml(text: string, style: string): string {
  const needsPreserve = text !== text.trim()
  const space = needsPreserve ? ' xml:space="preserve"' : ""
  return (
    `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>` +
    `<w:r><w:t${space}>${escapeXml(text)}</w:t></w:r></w:p>`
  )
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:color w:val="E5342B"/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:color w:val="A8871F"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style></w:styles>`

function documentXml(paragraphs: string[], title?: string): string {
  const parts: string[] = [
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`,
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>`,
  ]
  if (title) {
    parts.push(paragraphXml(title, "Title"))
    parts.push(paragraphXml("", "Normal"))
  }
  for (const paragraph of paragraphs) {
    if (paragraph === "") {
      parts.push(paragraphXml("", "Normal"))
    } else if (paragraph.startsWith("# ")) {
      parts.push(paragraphXml(paragraph.slice(2), "Heading1"))
    } else {
      parts.push(paragraphXml(paragraph, "Normal"))
    }
  }
  parts.push(
    `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`
  )
  return parts.join("")
}

export interface DocxOptions {
  title?: string
}

export function buildDocx(
  paragraphs: string[],
  options?: DocxOptions
): Uint8Array {
  const encoder = new TextEncoder()
  return buildZip([
    { name: "[Content_Types].xml", data: encoder.encode(CONTENT_TYPES) },
    { name: "_rels/.rels", data: encoder.encode(RELS) },
    { name: "word/styles.xml", data: encoder.encode(STYLES) },
    {
      name: "word/document.xml",
      data: encoder.encode(documentXml(paragraphs, options?.title)),
    },
  ])
}

export function downloadDocx(
  filename: string,
  paragraphs: string[],
  options?: DocxOptions
): void {
  const data = buildDocx(paragraphs, options)
  // Copy into a fresh ArrayBuffer so the Blob holds exactly these bytes.
  const copy = new Uint8Array(data.length)
  copy.set(data)
  const blob = new Blob([copy.buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
