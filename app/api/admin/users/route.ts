// GET /api/admin/users — list every registered user (admin only).
// POST /api/admin/users — ban or unban a user (admin only).

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase-server"
import { ADMIN_EMAIL } from "@/lib/legal-store"

export const dynamic = "force-dynamic"

const NO_STORE = { "Cache-Control": "no-store, max-age=0" }

function noStoreJson(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...NO_STORE, "Content-Type": "application/json" },
  })
}

interface AdminUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  banned: boolean
}

async function requireAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    return data.user?.email === ADMIN_EMAIL
  } catch {
    return false
  }
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseClient(url, key, { auth: { persistSession: false } })
}

export async function GET() {
  if (!(await requireAdmin())) {
    return noStoreJson({ error: "Admin access required." }, 403)
  }
  const admin = serviceClient()
  if (!admin) {
    return noStoreJson(
      { error: "Service key not configured on the server." },
      503
    )
  }
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })
  if (error) {
    return noStoreJson({ error: error.message }, 502)
  }
  const users: AdminUser[] = data.users.map((user) => ({
    id: user.id,
    email: user.email ?? "(no email)",
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at ?? null,
    banned: user.banned_until
      ? new Date(user.banned_until).getTime() > Date.now()
      : false,
  }))
  return noStoreJson({ users, total: data.total ?? users.length })
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return noStoreJson({ error: "Admin access required." }, 403)
  }
  let body: { userId?: string; action?: string; days?: number }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return noStoreJson({ error: "Invalid JSON body." }, 400)
  }
  if (!body.userId || typeof body.userId !== "string") {
    return noStoreJson({ error: "userId is required." }, 400)
  }
  if (body.action !== "ban" && body.action !== "unban") {
    return noStoreJson(
      { error: 'action must be "ban" or "unban".' },
      400
    )
  }
  const admin = serviceClient()
  if (!admin) {
    return noStoreJson(
      { error: "Service key not configured on the server." },
      503
    )
  }
  const days =
    typeof body.days === "number" && body.days >= 1 && body.days <= 3650
      ? Math.floor(body.days)
      : 7
  const update =
    body.action === "ban"
      ? { ban_duration: `${days * 24}h` }
      : { ban_duration: "none" }
  const { error } = await admin.auth.admin.updateUserById(body.userId, update)
  if (error) {
    return noStoreJson({ error: error.message }, 502)
  }
  return noStoreJson({ ok: true, action: body.action })
}
