// Server-side persistence for source-grounded generation.
//
// Production store is Supabase (see supabase/migrations/*_legal_grounding.sql).
// Every read falls back to the static verified repository in
// lib/legal-sources.ts so generation keeps working offline / before the
// migration is applied. Writes are best-effort and never block generation.
//
// Version discipline: legal sources are never silently replaced —
// recordSourceCheck() bumps the version row history in
// legal_source_versions, and generated documents snapshot the exact
// provisions used in document_versions.

import {
  LEGAL_PROVISIONS,
  LEGAL_SOURCES,
  type LegalProvision,
  type LegalSource,
} from "@/lib/legal-sources"

export const ADMIN_EMAIL = "michaelkariuki281@gmail.com"

interface GenerationInput {
  userId: string
  docType: string
  formData: Record<string, string>
  provisionIds: string[]
  validationStatus: string
  missingInfo: string[]
  generatedText: string
}

async function getServerSupabase() {
  const { createClient } = await import("@/lib/supabase-server")
  return createClient()
}

export async function getLegalSources(): Promise<LegalSource[]> {
  try {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from("legal_sources")
      .select(
        "id, title, citation, jurisdiction, publisher, publication_details, effective_date, source_url, license_note, verification_status, version, last_checked_at, retrieved_at"
      )
      .order("title")
    if (error || !data || data.length === 0) return LEGAL_SOURCES
    return data.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      citation: row.citation as string,
      jurisdiction: (row.jurisdiction as string) ?? "Kenya",
      publisher: row.publisher as string,
      publicationDetails: (row.publication_details as string) ?? "",
      effectiveDate: (row.effective_date as string) ?? "",
      sourceUrl: (row.source_url as string) ?? "",
      licenseNote: (row.license_note as string) ?? "",
      verificationStatus:
        row.verification_status as LegalSource["verificationStatus"],
      version: (row.version as number) ?? 1,
      lastCheckedAt: (row.last_checked_at as string) ?? "",
      retrievedAt: (row.retrieved_at as string) ?? "",
    }))
  } catch {
    return LEGAL_SOURCES
  }
}

export async function getLegalProvisions(): Promise<LegalProvision[]> {
  try {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from("legal_provisions")
      .select(
        "id, source_id, article_or_section, heading, summary, context_note, keywords, doc_types, verification_status, source_url, retrieved_at"
      )
    if (error || !data || data.length === 0) return LEGAL_PROVISIONS
    return data.map((row) => ({
      id: row.id as string,
      sourceId: row.source_id as string,
      articleOrSection: row.article_or_section as string,
      heading: row.heading as string,
      summary: (row.summary as string) ?? "",
      contextNote: (row.context_note as string) ?? "",
      keywords: (row.keywords as string[]) ?? [],
      docTypes: (row.doc_types as string[]) ?? [],
      verificationStatus:
        row.verification_status as LegalProvision["verificationStatus"],
      sourceUrl: (row.source_url as string) ?? "",
      retrievedAt: (row.retrieved_at as string) ?? "",
      verbatimQuote: null,
    }))
  } catch {
    return LEGAL_PROVISIONS
  }
}

/** Record a periodic official-source check; retains history, never overwrites it. */
export async function recordSourceCheck(
  sourceId: string,
  changeNote: string,
  checkedBy: string | null
): Promise<{ recorded: boolean }> {
  try {
    const supabase = await getServerSupabase()
    const { data: current } = await supabase
      .from("legal_sources")
      .select("version")
      .eq("id", sourceId)
      .maybeSingle()
    const nextVersion = ((current?.version as number) ?? 0) + 1
    const checkedAt = new Date().toISOString()
    const { error: versionError } = await supabase
      .from("legal_source_versions")
      .insert({
        source_id: sourceId,
        version: nextVersion,
        change_note: changeNote,
        checked_at: checkedAt,
        checked_by: checkedBy,
      })
    if (versionError) return { recorded: false }
    await supabase
      .from("legal_sources")
      .update({ version: nextVersion, last_checked_at: checkedAt })
      .eq("id", sourceId)
    return { recorded: true }
  } catch {
    return { recorded: false }
  }
}

export async function saveGeneration(
  input: GenerationInput
): Promise<{ generationId: string | null; versionNo: number | null }> {
  try {
    const supabase = await getServerSupabase()
    const { data: generation, error } = await supabase
      .from("document_generations")
      .insert({
        user_id: input.userId,
        doc_type: input.docType,
        form_data: input.formData,
        provision_ids: input.provisionIds,
        validation_status: input.validationStatus,
        missing_info: input.missingInfo,
      })
      .select("id")
      .single()
    if (error || !generation) return { generationId: null, versionNo: null }

    const versionNo = await nextVersionNo(supabase, input.userId, input.docType)
    await supabase.from("document_versions").insert({
      generation_id: (generation as { id: string }).id,
      version_no: versionNo,
      generated_text: input.generatedText,
      provision_snapshot: input.provisionIds,
    })
    return { generationId: (generation as { id: string }).id, versionNo }
  } catch {
    return { generationId: null, versionNo: null }
  }
}

// Supabase client type is structural; keep the helper loosely typed.
async function nextVersionNo(
  supabase: Awaited<ReturnType<typeof getServerSupabase>>,
  userId: string,
  docType: string
): Promise<number> {
  try {
    const { data } = await supabase
      .from("document_generations")
      .select("id, document_versions(version_no)")
      .eq("user_id", userId)
      .eq("doc_type", docType)
    let max = 0
    for (const row of (data as Array<{
      document_versions: Array<{ version_no: number }>
    }>) ?? []) {
      for (const version of row.document_versions ?? []) {
        if (version.version_no > max) max = version.version_no
      }
    }
    return max + 1
  } catch {
    return 1
  }
}

export interface VersionRecord {
  id: string
  generationId: string
  versionNo: number
  generatedText: string
  createdAt: string
}

export async function listVersions(
  userId: string,
  docType: string
): Promise<VersionRecord[]> {
  try {
    const supabase = await getServerSupabase()
    const { data, error } = await supabase
      .from("document_versions")
      .select(
        "id, generation_id, version_no, generated_text, created_at, document_generations!inner(user_id, doc_type)"
      )
      .eq("document_generations.user_id", userId)
      .eq("document_generations.doc_type", docType)
      .order("created_at", { ascending: false })
      .limit(20)
    if (error || !data) return []
    return (
      data as Array<{
        id: string
        generation_id: string
        version_no: number
        generated_text: string
        created_at: string
      }>
    ).map((row) => ({
      id: row.id,
      generationId: row.generation_id,
      versionNo: row.version_no,
      generatedText: row.generated_text,
      createdAt: row.created_at,
    }))
  } catch {
    return []
  }
}
