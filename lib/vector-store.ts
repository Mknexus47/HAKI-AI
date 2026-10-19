// Local vector index for HAKI AI's legal repository.
//
// Scale note: the verified repository (lib/legal-sources.ts) currently holds
// ~20 provisions across 7 Kenyan Acts — small enough to index in memory at
// module load, with no external vector database required. The index is a
// TF-IDF vector per provision plus cosine similarity search; the design
// mirrors how a hosted vector database (embeddings + ANN) would behave, and
// can be swapped for pgvector/embeddings later without changing callers.
//
// Bilingual queries: provision text is English, so common Swahili legal
// terms in the user's query are expanded to English equivalents before
// embedding (SW_EN_EXPANSION). Both original and expanded tokens count.
//
// Hard rule inherited from lib/legal-retrieval.ts: a high semantic score
// alone never proves a provision is applicable — chat RAG presents
// retrieved provisions as "sources to check", never as verified advice.

import {
  LEGAL_PROVISIONS,
  getSourceById,
  type LegalProvision,
  type LegalSource,
} from "@/lib/legal-sources"

export interface VectorSearchHit {
  provision: LegalProvision
  source: LegalSource
  cosine: number // 0..1
  keywordScore: number // 0..1 share of query terms present in the provision text
  score: number // 0.6 * cosine + 0.4 * keywordScore
  matchedTerms: string[]
}

const STOPWORDS = new Set([
  // English
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with",
  "my", "me", "i", "is", "are", "was", "were", "be", "been", "by", "as",
  "at", "from", "that", "this", "it", "its", "their", "our", "your",
  "you", "we", "they", "he", "she", "his", "her", "what", "which", "who",
  "whom", "how", "when", "where", "why", "can", "could", "should", "would",
  "will", "shall", "may", "might", "must", "do", "does", "did", "have",
  "has", "had", "not", "no", "yes", "if", "then", "than", "so", "such",
  "into", "about", "after", "before", "between", "during", "please",
  "kindly", "dear", "hello", "hi", "hey", "tell", "give", "get", "got",
  "out", "kept", "keep", "move", "moved", "still", "even", "also",
  "really", "much", "many", "need", "needs", "want", "wants", "right",
  "rights", "thing", "things", "anyway", "back", "just", "only", "over",
  "am", "was", "been", "being", "there", "here", "one", "two", "let",
  // Swahili
  "ya", "ya_", "wa", "na", "ni", "kwa", "katika", "hii", "hiyo", "ile",
  "hilo", "haya", "sasa", "basi", "lakini", "au", "kama", "pia", "tu",
  "bado", "tayari", "hapa", "pale", "yangu", "wangu", "langu", "dangu",
  "nchi", "sheria", "habari", "tafadhali", "sana", "zaidi", "chini",
  "juu", "baada", "kabla", "wakati", "hadi", "kila", "baadhi", "nini",
  "gani", "lini", "wapi", "kwanini", "nani", "sisi", "nyinyi", "wao",
])

// Common Swahili legal terms → English equivalents used in the repository.
// Matching is on individual tokens (prefix-insensitive: query tokens are
// also matched by startsWith for keys longer than 5 characters).
const SW_EN_EXPANSION: Record<string, string[]> = {
  mpangaji: ["tenant", "tenancy"],
  wapangaji: ["tenant", "tenancy"],
  pango: ["rent", "tenancy"],
  upangaji: ["tenancy", "tenancy agreement"],
  mmiliki: ["landlord"],
  wenye: ["landlord"],
  "nyumba": ["property", "premises"],
  kodi: ["rent"],
  kodiya: ["rent"],
  amana: ["deposit"],
  amani: ["deposit"],
  mishahara: ["salary", "wages"],
  mshahara: ["salary", "wages"],
  chelewa: ["late", "delay", "delayed", "overdue"],
  kuchelewa: ["late", "delay", "delayed", "overdue"],
  imechelewa: ["late", "delayed", "overdue", "unpaid"],
  kulipwa: ["paid", "payment"],
  lipwa: ["paid", "payment"],
  kulipia: ["pay", "payment"],
  malipo: ["payment", "paid", "wages"],
  hayajalipwa: ["unpaid", "overdue"],
  kazi: ["employment", "work"],
  ajira: ["employment"],
  mwajiri: ["employer"],
  mfanyakazi: ["employee"],
  kufukuzwa: ["dismissal", "termination"],
  fukuzwa: ["dismissal", "termination"],
  kuajiri: ["employment"],
  deni: ["debt"],
  madai: ["demand", "claim"],
  mkopo: ["loan"],
  mkataba: ["agreement", "contract"],
  biashara: ["business"],
  huduma: ["services"],
  manunuzi: ["consumer", "shopping", "purchase"],
  bidhaa: ["goods"],
  muuzaji: ["seller"],
  manunuzi_: ["consumer"],
  marejesho: ["refund"],
  malalamiko: ["complaint"],
  lalamiko: ["complaint"],
  kilalamu: ["complaint"],
  faini: ["penalty", "fine"],
  dhamana: ["warranty"],
  saini: ["signature"],
  sainiwa: ["signed"],
  notice: ["notice"],
  kujulishwa: ["notice"],
  kutalaka: ["divorce"],
  talaka: ["divorce"],
  korti: ["court"],
  wizi: ["theft"],
  urithi: ["inheritance", "succession"],
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token))
}

/** Expand Swahili tokens with their English repository equivalents. */
export function expandQuery(text: string): string[] {
  const base = tokenize(text)
  const expanded: string[] = [...base]
  for (const token of base) {
    const direct = SW_EN_EXPANSION[token]
    if (direct) {
      expanded.push(...direct)
      continue
    }
    if (token.length > 5) {
      for (const [key, values] of Object.entries(SW_EN_EXPANSION)) {
        if (key.length > 5 && token.startsWith(key)) {
          expanded.push(...values)
          break
        }
      }
    }
  }
  return expanded
}

interface IndexEntry {
  provision: LegalProvision
  source: LegalSource
  terms: Set<string>
  vector: Map<string, number>
}

function provisionDocumentText(
  provision: LegalProvision,
  source: LegalSource
): string {
  return [
    provision.heading,
    provision.summary,
    provision.contextNote,
    provision.keywords.join(" "),
    source.title,
    source.citation,
  ].join(" ")
}

function buildIndex(): {
  entries: IndexEntry[]
  idf: Map<string, number>
} {
  const entries: IndexEntry[] = []
  const docCounts = new Map<string, number>()

  for (const provision of LEGAL_PROVISIONS) {
    if (
      provision.verificationStatus === "withdrawn" ||
      provision.verificationStatus === "superseded"
    ) {
      continue
    }
    const source = getSourceById(provision.sourceId)
    if (!source) continue
    if (
      source.verificationStatus === "withdrawn" ||
      source.verificationStatus === "superseded"
    ) {
      continue
    }

    const tokens = tokenize(
      provisionDocumentText(provision, source)
    )
    const terms = new Set(tokens)
    for (const term of terms) {
      docCounts.set(term, (docCounts.get(term) ?? 0) + 1)
    }
    entries.push({ provision, source, terms, vector: new Map() })
  }

  const total = entries.length
  const idf = new Map<string, number>()
  for (const [term, count] of docCounts) {
    idf.set(term, Math.log((total + 1) / (count + 1)) + 1)
  }

  for (const entry of entries) {
    const tf = new Map<string, number>()
    for (const term of entry.terms) {
      tf.set(term, (tf.get(term) ?? 0) + 1)
    }
    let norm = 0
    for (const [term, count] of tf) {
      const weight = (1 + Math.log(count)) * (idf.get(term) ?? 1)
      entry.vector.set(term, weight)
      norm += weight * weight
    }
    norm = Math.sqrt(norm) || 1
    for (const [term, weight] of entry.vector) {
      entry.vector.set(term, weight / norm)
    }
  }

  return { entries, idf }
}

const INDEX = buildIndex()

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  for (const [term, weight] of small) {
    const other = large.get(term)
    if (other) dot += weight * other
  }
  return dot
}

/**
 * Vector + keyword search over the verified repository.
 * Returns the top `topK` provisions by combined score (results with a
 * combined score of 0 are omitted).
 */
export function searchProvisions(
  query: string,
  topK = 4
): VectorSearchHit[] {
  const terms = expandQuery(query)
  if (terms.length === 0) return []

  const termSet = new Set(terms)
  const tf = new Map<string, number>()
  for (const term of terms) {
    tf.set(term, (tf.get(term) ?? 0) + 1)
  }
  let norm = 0
  const queryVector = new Map<string, number>()
  for (const [term, count] of tf) {
    const weight = (1 + Math.log(count)) * (INDEX.idf.get(term) ?? 1)
    queryVector.set(term, weight)
    norm += weight * weight
  }
  norm = Math.sqrt(norm) || 1
  for (const [term, weight] of queryVector) {
    queryVector.set(term, weight / norm)
  }

  const hits: VectorSearchHit[] = []
  for (const entry of INDEX.entries) {
    const cosine = cosineSimilarity(queryVector, entry.vector)
    const matchedTerms = [...termSet].filter((term) => entry.terms.has(term))
    const keywordScore = matchedTerms.length / termSet.size
    const score = 0.6 * cosine + 0.4 * keywordScore
    if (score <= 0.02) continue
    hits.push({
      provision: entry.provision,
      source: entry.source,
      cosine,
      keywordScore,
      score,
      matchedTerms,
    })
  }

  hits.sort((a, b) => b.score - a.score)
  return hits.slice(0, topK)
}

/** Repository size — useful for tests and diagnostics. */
export const VECTOR_INDEX_SIZE = INDEX.entries.length
