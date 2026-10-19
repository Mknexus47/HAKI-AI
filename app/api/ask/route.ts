// POST /api/ask — RAG-powered legal-information answers (server-side).
//
// Body: { question: string, lang?: "en" | "sw" }
// Response: {
//   answer: string,
//   engine: "rag" | "template",
//   reason?: "high-risk" | "greeting" | "out-of-scope" | "no-key" | "no-evidence" | "llm-failed",
//   sources: RagSource[],
// }
//
// Flow: validate → gate (high-risk / greeting / scope, using the SAME
// deterministic rules as lib/chat.ts) → vector retrieval over the verified
// repository → Gemini grounded answer. Any failure or missing
// GEMINI_API_KEY falls back to the deterministic template answer, so the
// endpoint always works.

import {
  getAnswer,
  isGreetingText,
  isHighRiskQuestion,
  hasTopicMatch,
} from "@/lib/chat"
import {
  generateWithGemini,
  isRagConfigured,
  retrieveForQuestion,
  toRagSources,
} from "@/lib/rag"
import type { Language } from "@/lib/i18n"

interface AskBody {
  question?: string
  lang?: string
}

function templatePayload(question: string, lang: Language, reason: string) {
  const message = getAnswer(question, lang)
  return Response.json({
    answer: message.text,
    engine: "template" as const,
    reason,
    sources: [],
  })
}

export async function POST(request: Request) {
  let body: AskBody
  try {
    body = (await request.json()) as AskBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const question = (body.question ?? "").trim()
  if (!question) {
    return Response.json({ error: "question is required." }, { status: 400 })
  }
  if (question.length > 2000) {
    return Response.json(
      { error: "question is too long (max 2000 characters)." },
      { status: 400 }
    )
  }
  const lang: Language = body.lang === "sw" ? "sw" : "en"

  // Deterministic gates — these never invoke the LLM.
  if (isHighRiskQuestion(question)) {
    return templatePayload(question, lang, "high-risk")
  }
  if (isGreetingText(question)) {
    return templatePayload(question, lang, "greeting")
  }
  if (!hasTopicMatch(question)) {
    return templatePayload(question, lang, "out-of-scope")
  }

  if (!isRagConfigured()) {
    return templatePayload(question, lang, "no-key")
  }

  const hits = retrieveForQuestion(question, 4)
  if (hits.length === 0) {
    return templatePayload(question, lang, "no-evidence")
  }

  const answer = await generateWithGemini(question, lang, hits)
  if (!answer) {
    return templatePayload(question, lang, "llm-failed")
  }

  return Response.json({
    answer,
    engine: "rag" as const,
    sources: toRagSources(hits),
  })
}
