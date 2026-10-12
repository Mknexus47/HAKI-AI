// Source-grounded document generation (pipeline steps 6–7).
//
// Step 6: generate the document using retrieved evidence + approved fixed
// templates (lib/documents.ts). The generator NEVER invents authorities:
// the only legal citations it can emit are rendered from the evidence
// passed in — there is no language model in this path at all.
//
// Step 7: validate every legal citation against the retrieved source
// before returning the document (validateCitations). Anything that looks
// like a specific legal authority but cannot be traced to the evidence —
// invented sections, articles, quotations, or court cases — is flagged and
// the generation is marked "flagged-needs-review", never silently passed.
//
// Labelling discipline: the output separates (a) user-provided facts,
// (b) ordinary template drafting language, and (c) verified legal
// authorities, so a reader can never mistake drafting text for law.

import {
  DOCUMENT_REQUIRED_FIELDS,
  buildParagraphsForDoc,
} from "@/lib/documents"
import {
  retrieveLegalEvidence,
  type RetrievalResult,
} from "@/lib/legal-retrieval"

export type ValidationStatus = "passed" | "flagged-needs-review"

export interface CitationFinding {
  excerpt: string
  reason: string
}

export interface CitationValidation {
  ok: boolean
  status: ValidationStatus
  findings: CitationFinding[]
}

export interface GroundedDocument {
  docType: string
  paragraphs: string[] // full document: body + grounding sections
  bodyParagraphs: string[]
  missingInfo: string[]
  advocateNotes: string[]
  retrieval: RetrievalResult
  validation: CitationValidation
}

// Matches specific legal authorities: "Section 28", "Article 41",
// "Rule 5", "Cap. 501", "Employment Act, 2007", "[2021] eKLR",
// "Republic v ...", "A v B" case names.
const CITATION_PATTERNS: RegExp[] = [
  /\b(Section|Sections|Article|Articles|Rule|Rules|Regulation|Regulations|Schedule|Part)\s+[IVXLCDM0-9][\w().-]*/gi,
  /\bCap\.\s*[0-9]+[A-Z]*/gi,
  /\b[A-Z][\w\s&'’.-]{2,60}?\bAct,?\s*(?:No\.\s*\d+\s+of\s*)?(?:19|20)\d{2}\b/g,
  /\[\d{4}\]\s*eKLR\b/g,
  /\bRepublic\s+v(?:s|\.)?\s+[A-Z]/g,
  /\b[A-Z][\w.'-]*(?:\s+[A-Z][\w.'-]*)*\s+v(?:s|\.)?\s+[A-Z][\w.'-]*/g,
]

// Double-quoted spans that purport to state law ("... provides that ...").
const QUOTATION_PATTERN =
  /"[^"]*\b(section|article|cap\.|act of parliament|provides that|required by law|the law requires)\b[^"]*"/gi

/** Fields the user left blank — flagged, never guessed. */
export function findMissingFields(
  docType: string,
  form: Record<string, string>
): string[] {
  const required = DOCUMENT_REQUIRED_FIELDS[docType] ?? []
  return required.filter((field) => !(form[field] ?? "").trim())
}

function humanizeField(field: string): string {
  return field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase())
}

const GENERIC_ADVOCATE_NOTE =
  "Ask a licensed advocate of the High Court of Kenya to confirm the applicable law and review this document before signing, sending, or relying on it."

const ADVOCATE_NOTES_BY_TYPE: Record<string, string[]> = {
  affidavit: [
    "An affidavit has no legal effect until sworn before a commissioner for oaths (or other authorised officer) who completes the jurat with the place and date.",
    "A false declaration is an offence — confirm the obligations with your advocate.",
    GENERIC_ADVOCATE_NOTE,
  ],
  "tenancy-agreement": [
    "Ask an advocate to confirm deposit handling, repair duties, rent-review and termination steps for your specific premises.",
    GENERIC_ADVOCATE_NOTE,
  ],
  "employment-contract": [
    "Ask an advocate to confirm probation, benefits, working-time, leave and termination terms for your specific engagement.",
    GENERIC_ADVOCATE_NOTE,
  ],
  "demand-letter": [GENERIC_ADVOCATE_NOTE],
  "rent-acknowledgement": [GENERIC_ADVOCATE_NOTE],
  "service-agreement": [
    "For high-value or complex work, have a licensed advocate review before signing.",
    GENERIC_ADVOCATE_NOTE,
  ],
  "loan-acknowledgement": [GENERIC_ADVOCATE_NOTE],
  "complaint-letter": [GENERIC_ADVOCATE_NOTE],
  "refund-letter": [GENERIC_ADVOCATE_NOTE],
}

function buildReferenceParagraphs(retrieval: RetrievalResult): string[] {
  const lines: string[] = ["", "# LEGAL REFERENCES (SOURCE-GROUNDED)", ""]
  if (!retrieval.sufficient) {
    lines.push(
      retrieval.limitationNotice ??
        "No applicable legal provision could be verified for this document."
    )
    lines.push(
      "No legal authorities are cited in this document. Do not treat any template wording above as a statement of law."
    )
    return lines
  }
  lines.push(
    "Each authority below was retrieved from HAKI AI's verified repository of Kenyan legal sources. These are the ONLY legal authorities cited in this document."
  )
  lines.push("")
  for (const item of retrieval.evidence) {
    lines.push(
      `• ${item.source.title} (${item.source.citation}), ${item.provision.articleOrSection} — ${item.provision.heading}. Relevance: ${item.provision.summary} Source: ${item.provision.sourceUrl} (Verification: ${item.provision.verificationStatus}; repository record retrieved ${item.provision.retrievedAt}; source version ${item.source.version}, last checked ${item.source.lastCheckedAt}.)`
    )
    lines.push("")
  }
  lines.push(
    "Full authoritative text: follow the source links above on Kenya Law. The relevance notes are descriptive summaries only — they are not quotations and must not be relied on as the text of the law."
  )
  return lines
}

/**
 * Validate that every specific-looking legal citation in the generated
 * text traces back to the retrieved evidence. The fixed templates contain
 * no specific citations, so ANY citation-like string outside the generated
 * Legal References section is treated as unsupported (this catches
 * fabricated sections/articles/cases, including ones smuggled in through
 * user form input).
 */
export function validateCitations(
  paragraphs: string[],
  retrieval: RetrievalResult
): CitationValidation {
  const findings: CitationFinding[] = []
  const referencesStart = paragraphs.findIndex((paragraph) =>
    paragraph.startsWith("# LEGAL REFERENCES")
  )
  // The references block ends at the next heading (e.g. advocate review).
  // Bullets after it (review notes, validation notices) are ordinary
  // drafting language, not authorities, and must not be verified as such.
  let referencesEnd = paragraphs.length
  if (referencesStart !== -1) {
    const nextHeading = paragraphs.findIndex(
      (paragraph, index) =>
        index > referencesStart && paragraph.startsWith("# ")
    )
    referencesEnd = nextHeading === -1 ? paragraphs.length : nextHeading
  }
  const bodyEnd = referencesStart === -1 ? paragraphs.length : referencesStart

  const evidenceNumbers = new Set<string>()
  const evidenceTitles: string[] = []
  for (const item of retrieval.evidence) {
    const numbers = item.provision.articleOrSection.match(/\d+/g) ?? []
    for (const number of numbers) evidenceNumbers.add(number)
    evidenceTitles.push(item.source.title.toLowerCase())
  }
  paragraphs.forEach((paragraph, index) => {
    if (index >= bodyEnd) return // only pre-references text is scanned
    const matches = new Set<string>()
    for (const pattern of CITATION_PATTERNS) {
      pattern.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = pattern.exec(paragraph)) !== null) {
        matches.add(match[0])
      }
    }
    QUOTATION_PATTERN.lastIndex = 0
    let quote: RegExpExecArray | null
    while ((quote = QUOTATION_PATTERN.exec(paragraph)) !== null) {
      matches.add(quote[0].slice(0, 80))
    }
    for (const match of matches) {
      const numbers = match.match(/\d+/g) ?? []
      const mentionsKnownSource = evidenceTitles.some((title) => {
        const significant = title
          .replace(/^(the|constitution of|act)\s+/i, "")
          .split(/[\s,]+/)
          .filter((word) => word.length > 4)
        const haystack = `${paragraph.toLowerCase()} ${match.toLowerCase()}`
        return significant.some((word) => haystack.includes(word))
      })
      const numbersKnown =
        numbers.length === 0 || numbers.every((n) => evidenceNumbers.has(n))
      // Case-law markers ([2024] eKLR, "Republic v ...") can never be
      // produced from this repository, which stores legislation only.
      const looksLikeCaseLaw =
        /\beKLR\b/i.test(match) ||
        /\bRepublic\s+v/i.test(match) ||
        /\s+v(?:s|\.)?\s+[A-Z]/.test(match)
      if (looksLikeCaseLaw || !numbersKnown || !mentionsKnownSource) {
        findings.push({
          excerpt: match.length > 120 ? `${match.slice(0, 120)}…` : match,
          reason:
            "This looks like a specific legal authority but cannot be traced to the verified provisions retrieved for this document. It must be removed or verified against an authoritative source by a qualified advocate before use.",
        })
      }
    }
  })

  // Also verify each emitted reference line resolves to exactly one evidence provision.
  const referenceLines = paragraphs
    .slice(
      referencesStart === -1 ? paragraphs.length : referencesStart,
      referencesEnd
    )
    .filter((paragraph) => paragraph.startsWith("• "))
  for (const line of referenceLines) {
    const resolves = retrieval.evidence.some(
      (item) =>
        line.includes(item.source.title) &&
        line.includes(item.provision.heading) &&
        line.includes(item.provision.sourceUrl)
    )
    if (!resolves) {
      findings.push({
        excerpt: line.slice(0, 120),
        reason:
          "A Legal References entry does not resolve to a retrieved verified provision. The references section may have been tampered with.",
      })
    }
  }

  return {
    ok: findings.length === 0,
    status: findings.length === 0 ? "passed" : "flagged-needs-review",
    findings,
  }
}

/** Pipeline step 6+7: grounded assembly + citation validation. */
export function generateGroundedDocument(
  docType: string,
  form: Record<string, string>,
  today: string,
  asOfDate?: string
): GroundedDocument {
  const bodyParagraphs = buildParagraphsForDoc(docType, form, today)
  const retrieval = retrieveLegalEvidence(docType, form, asOfDate)
  const missingInfo = findMissingFields(docType, form)
  const advocateNotes = ADVOCATE_NOTES_BY_TYPE[docType] ?? [
    GENERIC_ADVOCATE_NOTE,
  ]

  const paragraphs: string[] = [...bodyParagraphs]
  paragraphs.push("", "# HOW THIS DOCUMENT WAS MADE", "")
  paragraphs.push(
    "User-provided facts: the names, dates, amounts, and descriptions you entered above."
  )
  paragraphs.push(
    "Template language: standard drafting text from a fixed HAKI AI template — not legal advice and not a statement of law."
  )
  paragraphs.push(
    retrieval.sufficient
      ? "Verified authorities: the Legal References section below — the only statements of law in this document."
      : "Verified authorities: none retrieved — this document cites no law (see limitation notice below)."
  )

  if (missingInfo.length > 0) {
    paragraphs.push("", "# INFORMATION STILL NEEDED", "")
    for (const field of missingInfo) {
      paragraphs.push(
        `• ${humanizeField(field)}: not provided — complete this field. HAKI AI does not guess missing facts.`
      )
    }
  }

  paragraphs.push(...buildReferenceParagraphs(retrieval))

  paragraphs.push("", "# ADVOCATE REVIEW REQUIRED", "")
  for (const note of advocateNotes) {
    paragraphs.push(`• ${note}`)
  }

  const validation = validateCitations(paragraphs, retrieval)
  if (!validation.ok) {
    paragraphs.push("", "# CITATION REVIEW REQUIRED", "")
    paragraphs.push(
      "Automated citation validation flagged the following text. It must be removed or verified against an authoritative source by a qualified Kenyan advocate before this document is used:"
    )
    paragraphs.push("")
    for (const finding of validation.findings) {
      paragraphs.push(`• "${finding.excerpt}" — ${finding.reason}`)
      paragraphs.push("")
    }
  }

  return {
    docType,
    paragraphs,
    bodyParagraphs,
    missingInfo,
    advocateNotes,
    retrieval,
    validation,
  }
}
