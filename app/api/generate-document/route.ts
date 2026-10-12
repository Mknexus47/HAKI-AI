// Grounded document-generation backend.
//
// POST /api/generate-document { docType, form, today?, asOfDate? }
//   Runs the full retrieval → generation → citation-validation pipeline
//   server-side and, when the caller is authenticated, persists the
//   generation plus an append-only version snapshot.
// GET /api/generate-document?docType=... — version history (auth required).

import { DOCUMENT_TITLES } from "@/lib/documents"
import { generateGroundedDocument } from "@/lib/legal-generation"
import { listVersions, saveGeneration } from "@/lib/legal-store"

interface GenerateBody {
  docType?: string
  form?: Record<string, string>
  today?: string
  asOfDate?: string
}

export async function POST(request: Request) {
  let body: GenerateBody
  try {
    body = (await request.json()) as GenerateBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const docType = body.docType ?? ""
  if (!DOCUMENT_TITLES[docType]) {
    return Response.json(
      { error: `Unknown document type "${docType}".` },
      { status: 400 }
    )
  }
  const form: Record<string, string> = body.form ?? {}
  const today =
    body.today ??
    new Date().toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })

  const grounded = generateGroundedDocument(docType, form, today, body.asOfDate)

  // Persist for authenticated users — best-effort, never blocks the response.
  let userId: string | null = null
  try {
    const { createClient } = await import("@/lib/supabase-server")
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } catch {
    userId = null
  }

  let generationId: string | null = null
  let versionNo: number | null = null
  if (userId) {
    const saved = await saveGeneration({
      userId,
      docType,
      formData: form,
      provisionIds: grounded.retrieval.evidence.map(
        (item) => item.provision.id
      ),
      validationStatus: grounded.validation.status,
      missingInfo: grounded.missingInfo,
      generatedText: grounded.paragraphs.join("\n"),
    })
    generationId = saved.generationId
    versionNo = saved.versionNo
  }

  return Response.json({
    docType,
    paragraphs: grounded.paragraphs,
    missingInfo: grounded.missingInfo,
    advocateNotes: grounded.advocateNotes,
    retrieval: {
      legalIssues: grounded.retrieval.legalIssues,
      evidence: grounded.retrieval.evidence.map((item) => ({
        provisionId: item.provision.id,
        sourceTitle: item.source.title,
        sourceCitation: item.source.citation,
        articleOrSection: item.provision.articleOrSection,
        heading: item.provision.heading,
        summary: item.provision.summary,
        sourceUrl: item.provision.sourceUrl,
        verificationStatus: item.provision.verificationStatus,
        matchedKeywords: item.matchedKeywords,
      })),
      semanticOnlyCount: grounded.retrieval.semanticOnly.length,
      sufficient: grounded.retrieval.sufficient,
      limitationNotice: grounded.retrieval.limitationNotice,
      retrievedAt: grounded.retrieval.retrievedAt,
    },
    validation: grounded.validation,
    generationId,
    versionNo,
  })
}

export async function GET(request: Request) {
  const docType = new URL(request.url).searchParams.get("docType") ?? ""
  if (!DOCUMENT_TITLES[docType]) {
    return Response.json(
      { error: `Unknown document type "${docType}".` },
      { status: 400 }
    )
  }
  try {
    const { createClient } = await import("@/lib/supabase-server")
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id ?? null
    if (!userId) {
      return Response.json({ error: "Login required." }, { status: 401 })
    }
    const versions = await listVersions(userId, docType)
    return Response.json({ docType, versions })
  } catch {
    return Response.json({ docType, versions: [] })
  }
}
