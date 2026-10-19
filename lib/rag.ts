// Retrieval-Augmented Generation for HAKI AI's Ask assistant (server-side).
//
// Pipeline: question → scope gate (lib/chat.ts) → vector retrieval over the
// verified Kenyan legal repository (lib/vector-store.ts) → Gemini generates
// an answer using ONLY the retrieved provisions as legal context → sources
// returned alongside the answer for user verification on Kenya Law.
//
// Safety rules:
// - The model never sees or free-texts section numbers outside the retrieved
//   context; the system prompt forbids inventing provisions, cases, or quotes.
// - Every source chip shown to the user comes from our retrieval, not from
//   the model's output.
// - If GEMINI_API_KEY is missing or the call fails, the caller falls back to
//   the deterministic templates in lib/chat.ts — the feature never breaks.
// - Answers are general legal information, never legal advice; the UI
//   disclaimer remains visible regardless of engine used.

import { searchProvisions, type VectorSearchHit } from "@/lib/vector-store"
import type { Language } from "@/lib/i18n"

export interface RagSource {
  title: string
  citation: string
  section: string
  heading: string
  summary: string
  url: string
}

export interface RagResult {
  answer: string
  sources: RagSource[]
}

const SYSTEM_INSTRUCTION: Record<Language, string> = {
  en:
    "You are HAKI AI, a Kenyan legal INFORMATION assistant. You give general legal information only — never legal advice, never a lawyer-client relationship. " +
    "Answer ONLY using the VERIFIED SOURCES provided in the user message. Every section, article, or Act you mention must appear verbatim in those sources. " +
    "If the sources do not cover the question, say plainly that HAKI AI could not verify an answer from its repository of Kenyan legal materials and direct the user to a licensed advocate of the High Court of Kenya or the Legal Aid Directory. " +
    "Never invent sections, articles, case names, quotations, or deadlines. " +
    "Answer in plain language (no legalese where avoidable), in no more than about 180 words, and end with the exact sentence: \"This is general legal information, not legal advice.\"",
  sw:
    "Wewe ni HAKI AI, msaidizi wa taarifa za KISHERIA wa Kenya. Unatoa taarifa za kisheria za ujumla tu — kamwe si ushauri wa kisheria, wala uhusiano wa wakili na mteja. " +
    "Jibu UKITUMIA tu VYANZO VILIVYOTHIBITISHA vilivyotolewa kwenye ujumbe wa mtumiaji. Kila sehemu, ibara, au sheria utakayotaja lazima ionekane hapo hapo kwenye vyanzo hivyo. " +
    "Kama vyanzo haviulizwi swali, sema wazi kwama HAKI AI haikuweza kuthibitisha jibu kutoka kwenye hazina yake ya taarifa za kisheria za Kenya, na mpeleke mtumiaji kwa Advocate wa Mahakama Kuu ya Kenya aliyeidhinishwa au Orodha ya Msaada wa Kisheria. " +
    "Usitengeneze sehemu za sheria, mabaraza, majina ya kesi, nukuu, wala muda wa mwisho. " +
    "Jibu kwa lugha rahisi, ndani ya maneno takribani 180, na umalize kwa sentensi ifuatayo kamili: \"Hii ni taarifa za kisheria za ujumla, si ushauri wa kisheria.\"",
}

function buildSourceBlocks(hits: VectorSearchHit[]): string {
  return hits
    .map(
      (hit, index) =>
        `[SOURCE ${index + 1}] ${hit.source.title} (${hit.source.citation}), ` +
        `${hit.provision.articleOrSection} — ${hit.provision.heading}\n` +
        `Summary (not a quotation): ${hit.provision.summary}\n` +
        `Confirm on Kenya Law: ${hit.provision.sourceUrl}`
    )
    .join("\n\n")
}

export function toRagSources(hits: VectorSearchHit[]): RagSource[] {
  return hits.map((hit) => ({
    title: hit.source.title,
    citation: hit.source.citation,
    section: hit.provision.articleOrSection,
    heading: hit.provision.heading,
    summary: hit.provision.summary,
    url: hit.provision.sourceUrl,
  }))
}

function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY?.trim() || null
}

export function isRagConfigured(): boolean {
  return getApiKey() !== null
}

/**
 * Call Google Gemini (generateContent REST API — no SDK dependency).
 * Returns the text, or null on any failure so the caller can fall back.
 */
export async function generateWithGemini(
  question: string,
  lang: Language,
  hits: VectorSearchHit[],
  signal?: AbortSignal
): Promise<string | null> {
  const apiKey = getApiKey()
  if (!apiKey || hits.length === 0) return null

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash"
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` +
    `?key=${encodeURIComponent(apiKey)}`

  const userMessage =
    "VERIFIED SOURCES (the only legal material you may use):\n\n" +
    buildSourceBlocks(hits) +
    "\n\n---\nUSER QUESTION: " +
    question.trim()

  try {
    const timeout =
      typeof AbortSignal.timeout === "function"
        ? AbortSignal.timeout(20_000)
        : undefined
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: signal ?? timeout,
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION[lang] }],
        },
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.15,
          maxOutputTokens: 2048,
          // Gemini 3.x spends output budget on internal "thinking", which
          // truncated visible answers at 700 tokens — disable it so the
          // whole answer lands in the response.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    })
    if (!response.ok) return null
    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    return text && text.length > 0 ? text : null
  } catch {
    return null
  }
}

/** Retrieve provisions relevant to a free-text chat question. */
export function retrieveForQuestion(
  question: string,
  topK = 4
): VectorSearchHit[] {
  return searchProvisions(question, topK)
}
