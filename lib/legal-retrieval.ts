// Retrieval pipeline for source-grounded generation (RAG over the verified
// repository in lib/legal-sources.ts).
//
// Pipeline steps (per spec):
//  1. Identify the requested document type and relevant legal issues.
//  2. Determine which Kenyan laws and provisions apply.
//  3. Search the verified repository using keyword AND semantic retrieval.
//  4. Retrieve the provision record with its surrounding context.
//  5. Verify the source is authoritative and applicable to the relevant date.
//
// Hard rule: semantic similarity alone is NEVER treated as proof of legal
// applicability. A provision becomes evidence only when it (a) allowlists
// the requested document type, (b) shares at least one keyword/phrase hit
// with the request, and (c) passes the authority/date verification gate.
// Semantic-only candidates are reported separately and never cited.

import {
  LEGAL_PROVISIONS,
  getSourceById,
  type LegalProvision,
  type LegalSource,
} from "@/lib/legal-sources"

export interface RetrievedEvidence {
  provision: LegalProvision
  source: LegalSource
  keywordScore: number // 0..1 — share of provision keywords hit
  semanticScore: number // 0..1 — trigram Jaccard similarity
  combinedScore: number // 0.6 * keyword + 0.4 * semantic
  matchedKeywords: string[]
}

export interface SemanticOnlyCandidate {
  provisionId: string
  sourceId: string
  semanticScore: number
  reasonExcluded: string
}

export interface RetrievalResult {
  docType: string
  legalIssues: string[]
  evidence: RetrievedEvidence[]
  semanticOnly: SemanticOnlyCandidate[]
  sufficient: boolean
  limitationNotice: string | null
  retrievedAt: string
}

function trigrams(text: string): Set<string> {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim()
  const grams = new Set<string>()
  for (let i = 0; i + 3 <= normalized.length; i++) {
    grams.add(normalized.slice(i, i + 3))
  }
  return grams
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const item of a) {
    if (b.has(item)) intersection += 1
  }
  return intersection / (a.size + b.size - intersection)
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Step 1: identify the document type and extract legal-issue signals. */
export function identifyLegalIssues(
  docType: string,
  form: Record<string, string>
): string[] {
  const haystack = `${docType} ${Object.values(form).join(" ")}`.toLowerCase()
  const issueSignals: Array<{ issue: string; patterns: RegExp[] }> = [
    {
      issue: "tenancy and rent",
      patterns: [
        /\brent\b/,
        /\btenant\b/,
        /\blandlord\b/,
        /\btenancy\b/,
        /\blease\b/,
        /\bevict/,
        /\bdeposit\b/,
      ],
    },
    {
      issue: "employment relationship",
      patterns: [
        /\bemploy/,
        /\bsalary\b/,
        /\bwage\b/,
        /\bdismiss/,
        /\bfired\b/,
        /\btermination\b/,
        /\bleave\b/,
        /\bduties\b/,
      ],
    },
    {
      issue: "consumer transaction",
      patterns: [
        /\bconsumer\b/,
        /\brefund\b/,
        /\bfaulty\b/,
        /\bdefective\b/,
        /\bwarranty\b/,
        /\bgoods\b/,
        /\bseller\b/,
        /\bbuyer\b/,
      ],
    },
    {
      issue: "debt recovery",
      patterns: [
        /\bdebt\b/,
        /\bowe[sd]?\b/,
        /\bowed\b/,
        /\bloan\b/,
        /\bpayment\b/,
        /\bamount\b/,
      ],
    },
    {
      issue: "contract formation",
      patterns: [
        /\bagreement\b/,
        /\bcontract\b/,
        /\bscope\b/,
        /\bparties\b/,
        /\bsign\b/,
      ],
    },
    {
      issue: "sworn statement",
      patterns: [
        /\baffidavit\b/,
        /\bswear\b/,
        /\bsworn\b/,
        /\boath\b/,
        /\bdeponent\b/,
        /\bjurat\b/,
        /\bcommissioner\b/,
      ],
    },
    {
      issue: "complaint and redress",
      patterns: [
        /\bcomplaint\b/,
        /\bremedy\b/,
        /\bunfair\b/,
        /\bdispute\b/,
        /\btribunal\b/,
      ],
    },
  ]
  return issueSignals
    .filter(({ patterns }) =>
      patterns.some((pattern) => pattern.test(haystack))
    )
    .map(({ issue }) => issue)
}

/**
 * Steps 2–5: search the repository and verify applicability.
 * `asOfDate` is an ISO date string; provisions whose source commenced
 * after that date, or whose source is superseded/withdrawn, are excluded.
 */
export function retrieveLegalEvidence(
  docType: string,
  form: Record<string, string>,
  asOfDate: string = new Date().toISOString().slice(0, 10),
  maxEvidence = 3
): RetrievalResult {
  const legalIssues = identifyLegalIssues(docType, form)
  const queryText = `${docType.replace(/-/g, " ")} ${legalIssues.join(" ")} ${Object.values(form).join(" ")}`
  const queryTrigrams = trigrams(queryText)

  const evidence: RetrievedEvidence[] = []
  const semanticOnly: SemanticOnlyCandidate[] = []

  for (const provision of LEGAL_PROVISIONS) {
    const source = getSourceById(provision.sourceId)
    if (!source) continue

    // Gate 1 — authority: withdrawn or superseded sources are never evidence.
    if (
      source.verificationStatus === "withdrawn" ||
      source.verificationStatus === "superseded"
    ) {
      continue
    }
    if (
      provision.verificationStatus === "withdrawn" ||
      provision.verificationStatus === "superseded"
    ) {
      continue
    }

    // Gate 2 — temporal applicability: the law must have commenced on/before the relevant date.
    if (source.effectiveDate > asOfDate) continue

    // Gate 3 — document-type allowlist (step 2 of the pipeline).
    const allowsDocType = provision.docTypes.includes(docType)

    // Keyword retrieval: whole-word/phrase hits against keywords + heading + summary.
    const searchable =
      `${provision.keywords.join(" ")} ${provision.heading} ${provision.summary}`.toLowerCase()
    const matchedKeywords = provision.keywords.filter((keyword) =>
      new RegExp(`\\b${escapeRegExp(keyword.toLowerCase())}\\b`).test(
        queryText.toLowerCase()
      )
    )
    const keywordScore =
      provision.keywords.length === 0
        ? 0
        : matchedKeywords.length / provision.keywords.length

    // Semantic retrieval: trigram Jaccard over provision search text.
    const semanticScore = jaccard(queryTrigrams, trigrams(searchable))

    if (!allowsDocType) {
      if (semanticScore >= 0.08) {
        semanticOnly.push({
          provisionId: provision.id,
          sourceId: provision.sourceId,
          semanticScore,
          reasonExcluded: `Does not apply to document type "${docType}" — semantic similarity alone is not proof of applicability.`,
        })
      }
      continue
    }

    // Hard rule: keyword overlap is required; semantic-only matches are reported, never cited.
    if (matchedKeywords.length === 0) {
      if (semanticScore >= 0.08) {
        semanticOnly.push({
          provisionId: provision.id,
          sourceId: provision.sourceId,
          semanticScore,
          reasonExcluded:
            "No keyword/phrase overlap with the request — semantic similarity alone is not proof of applicability.",
        })
      }
      continue
    }

    evidence.push({
      provision,
      source,
      keywordScore,
      semanticScore,
      combinedScore: 0.6 * keywordScore + 0.4 * semanticScore,
      matchedKeywords,
    })
  }

  evidence.sort((a, b) => b.combinedScore - a.combinedScore)
  const topEvidence = evidence.slice(0, maxEvidence)
  semanticOnly.sort((a, b) => b.semanticScore - a.semanticScore)

  const sufficient = topEvidence.length > 0
  const limitationNotice = sufficient
    ? null
    : "HAKI AI could not verify an applicable legal provision for this document in its repository of Kenyan sources. " +
      "No legal authority is cited below. Please add more detail about the legal issue, or ask a licensed advocate of the High Court of Kenya to identify the applicable law."

  return {
    docType,
    legalIssues,
    evidence: topEvidence,
    semanticOnly: semanticOnly.slice(0, 5),
    sufficient,
    limitationNotice,
    retrievedAt: new Date().toISOString(),
  }
}
