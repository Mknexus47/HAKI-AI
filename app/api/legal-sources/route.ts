// GET /api/legal-sources — public read of the verified repository.
// POST /api/legal-sources — record a periodic official-source check (admin only).

import {
  getLegalProvisions,
  getLegalSources,
  ADMIN_EMAIL,
  recordSourceCheck,
} from "@/lib/legal-store"
import { checkSourcesForStaleness } from "@/lib/source-maintenance"

export async function GET() {
  const [sources, provisions] = await Promise.all([
    getLegalSources(),
    getLegalProvisions(),
  ])
  const maintenance = checkSourcesForStaleness(sources)
  return Response.json({
    sources,
    provisions,
    maintenance: maintenance.filter((item) => item.stale),
    staleCount: maintenance.filter((item) => item.stale).length,
  })
}

export async function POST(request: Request) {
  let body: { sourceId?: string; changeNote?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }
  if (!body.sourceId || typeof body.sourceId !== "string") {
    return Response.json({ error: "sourceId is required." }, { status: 400 })
  }

  const { createClient } = await import("@/lib/supabase-server")
  let requester: string | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    requester = data.user?.email ?? null
  } catch {
    requester = null
  }
  if (requester !== ADMIN_EMAIL) {
    return Response.json({ error: "Admin access required." }, { status: 403 })
  }

  const result = await recordSourceCheck(
    body.sourceId,
    body.changeNote || "Periodic re-verification against the official source.",
    requester
  )
  if (!result.recorded) {
    return Response.json(
      { error: "Could not record the check (database unavailable?)." },
      { status: 503 }
    )
  }
  return Response.json({ ok: true, sourceId: body.sourceId })
}
