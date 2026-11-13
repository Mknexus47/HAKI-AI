"use client"

import * as React from "react"
import {
  LayoutDashboard,
  FileText,
  Scale,
  Users,
  Flag,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Ban,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-client"
import { DOCUMENT_TITLES } from "@/lib/documents"

export const ADMIN_EMAIL = "michaelkariuki281@gmail.com"

interface FlaggedRow {
  id: string
  reason: string
  snippet: string | null
  flag_count: number
  status: string
  created_at: string
}

interface FeedbackRow {
  id: string
  context: string
  helpful: boolean
  reason: string | null
  comment: string | null
  created_at: string
}

interface GenerationRow {
  id: string
  user_id: string
  doc_type: string
  validation_status: string
  created_at: string
}

interface SourceRow {
  id: string
  title: string
  citation: string
  publisher: string
  source_url: string
  verification_status: string
}

interface ProvisionRow {
  id: string
  source_id: string
  article_or_section: string
  heading: string
  summary: string
}

interface FaqRow {
  id: string
  question: string
  answer: string
  category: string
  position: number
  published: boolean
}

interface AdminUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  banned: boolean
}

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
const labelClassName = "mb-1.5 block text-sm font-medium text-slate-700"
const cardClassName = "card-gradient rounded-xl border p-8 shadow-sm"

export default function AdminPanel() {
  const [liveReady, setLiveReady] = React.useState(false)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [flags, setFlags] = React.useState<FlaggedRow[]>([])
  const [feedback, setFeedback] = React.useState<FeedbackRow[]>([])
  const [generations, setGenerations] = React.useState<GenerationRow[]>([])
  const [genCount, setGenCount] = React.useState<number | null>(null)
  const [sources, setSources] = React.useState<SourceRow[]>([])
  const [provisions, setProvisions] = React.useState<ProvisionRow[]>([])
  const [faqs, setFaqs] = React.useState<FaqRow[] | null>(null)
  const [faqError, setFaqError] = React.useState<string | null>(null)
  const [users, setUsers] = React.useState<AdminUser[] | null>(null)
  const [usersError, setUsersError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)
  const [banBusy, setBanBusy] = React.useState<string | null>(null)

  const [editSource, setEditSource] = React.useState<Partial<SourceRow> | null>(
    null
  )
  const [sourceIsNew, setSourceIsNew] = React.useState(false)
  const [editProv, setEditProv] = React.useState<Partial<ProvisionRow> | null>(
    null
  )
  const [provIsNew, setProvIsNew] = React.useState(false)
  const [editFaq, setEditFaq] = React.useState<Partial<FaqRow> | null>(null)
  const [faqIsNew, setFaqIsNew] = React.useState(false)

  const loadUsers = React.useCallback(async () => {
    const res = await fetch("/api/admin/users")
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      setUsersError(json?.error ?? `Failed to load users (HTTP ${res.status}).`)
      setUsers(null)
      return
    }
    setUsersError(null)
    setUsers((json.users as AdminUser[]) ?? [])
  }, [])

  React.useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    supabase.auth.getUser().then(async ({ data }) => {
      const email = data.user?.email ?? null
      if (cancelled) return
      const admin = email === ADMIN_EMAIL
      setIsAdmin(admin)
      setLiveReady(true)
      if (!admin) return
      const [flagRows, feedbackRows, genRows, genCountRes, sourceRows, provRows, faqRows] =
        await Promise.all([
          supabase
            .from("flagged_sessions")
            .select("id, reason, snippet, flag_count, status, created_at")
            .order("created_at", { ascending: false })
            .limit(25),
          supabase
            .from("feedback")
            .select("id, context, helpful, reason, comment, created_at")
            .order("created_at", { ascending: false })
            .limit(25),
          supabase
            .from("document_generations")
            .select("id, user_id, doc_type, validation_status, created_at")
            .order("created_at", { ascending: false })
            .limit(12),
          supabase
            .from("document_generations")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("legal_sources")
            .select("id, title, citation, publisher, source_url, verification_status")
            .order("title"),
          supabase
            .from("legal_provisions")
            .select("id, source_id, article_or_section, heading, summary")
            .order("article_or_section"),
          supabase
            .from("faq_entries")
            .select("id, question, answer, category, position, published")
            .order("position"),
        ])
      if (cancelled) return
      setFlags((flagRows.data as FlaggedRow[]) ?? [])
      setFeedback((feedbackRows.data as FeedbackRow[]) ?? [])
      setGenerations((genRows.data as GenerationRow[]) ?? [])
      if (!genCountRes.error) setGenCount(genCountRes.count ?? 0)
      setSources((sourceRows.data as SourceRow[]) ?? [])
      setProvisions((provRows.data as ProvisionRow[]) ?? [])
      if (faqRows.error) {
        setFaqs([])
        setFaqError(
          "FAQ table not created yet — run supabase/migrations/20261113000000_faq_content.sql in the Supabase SQL editor."
        )
      } else {
        setFaqs((faqRows.data as FaqRow[]) ?? [])
      }
      void loadUsers()
    })

    return () => {
      cancelled = true
    }
  }, [loadUsers])

  const updateFlag = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from("flagged_sessions").update({ status }).eq("id", id)
    setFlags((current) =>
      current.map((row) => (row.id === id ? { ...row, status } : row))
    )
  }

  const toggleUserBan = async (user: AdminUser) => {
    setBanBusy(user.id)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: user.banned ? "unban" : "ban",
          days: 7,
        }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setNotice(json?.error ?? `Failed to update user (HTTP ${res.status}).`)
        return
      }
      setNotice(null)
      await loadUsers()
    } finally {
      setBanBusy(null)
    }
  }

  const saveSource = async () => {
    if (!editSource) return
    const required = ["title", "citation", "publisher", "source_url"]
    if (required.some((field) => !String(editSource[field as keyof SourceRow] ?? "").trim())) {
      setNotice("Title, citation, publisher and URL are all required.")
      return
    }
    const supabase = createClient()
    const payload = {
      title: editSource.title!.trim(),
      citation: editSource.citation!.trim(),
      publisher: editSource.publisher!.trim(),
      source_url: editSource.source_url!.trim(),
      verification_status:
        editSource.verification_status?.trim() || "sourced-pending-fulltext-check",
    }
    const { error } = sourceIsNew
      ? await supabase
          .from("legal_sources")
          .insert({ id: crypto.randomUUID(), ...payload })
      : await supabase
          .from("legal_sources")
          .update(payload)
          .eq("id", editSource.id!)
    if (error) {
      setNotice(`Could not save source: ${error.message}`)
      return
    }
    setNotice(null)
    setEditSource(null)
    setSourceIsNew(false)
    const { data } = await supabase
      .from("legal_sources")
      .select("id, title, citation, publisher, source_url, verification_status")
      .order("title")
    setSources((data as SourceRow[]) ?? [])
  }

  const deleteSource = async (id: string) => {
    if (!window.confirm("Delete this source? Its provisions are removed too.")) return
    const supabase = createClient()
    const { error } = await supabase.from("legal_sources").delete().eq("id", id)
    if (error) {
      setNotice(`Could not delete source: ${error.message}`)
      return
    }
    setNotice(null)
    setSources((current) => current.filter((row) => row.id !== id))
    setProvisions((current) => current.filter((row) => row.source_id !== id))
  }

  const saveProvision = async () => {
    if (!editProv) return
    if (
      !editProv.source_id ||
      !editProv.article_or_section?.trim() ||
      !editProv.heading?.trim()
    ) {
      setNotice("Source, section/article and heading are required.")
      return
    }
    const supabase = createClient()
    const payload = {
      source_id: editProv.source_id,
      article_or_section: editProv.article_or_section.trim(),
      heading: editProv.heading.trim(),
      summary: editProv.summary?.trim() || "",
    }
    const { error } = provIsNew
      ? await supabase
          .from("legal_provisions")
          .insert({ id: crypto.randomUUID(), ...payload })
      : await supabase
          .from("legal_provisions")
          .update(payload)
          .eq("id", editProv.id!)
    if (error) {
      setNotice(`Could not save provision: ${error.message}`)
      return
    }
    setNotice(null)
    setEditProv(null)
    setProvIsNew(false)
    const { data } = await supabase
      .from("legal_provisions")
      .select("id, source_id, article_or_section, heading, summary")
      .order("article_or_section")
    setProvisions((data as ProvisionRow[]) ?? [])
  }

  const deleteProvision = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("legal_provisions")
      .delete()
      .eq("id", id)
    if (error) {
      setNotice(`Could not delete provision: ${error.message}`)
      return
    }
    setNotice(null)
    setProvisions((current) => current.filter((row) => row.id !== id))
  }

  const saveFaq = async () => {
    if (!editFaq) return
    if (!editFaq.question?.trim() || !editFaq.answer?.trim()) {
      setNotice("Question and answer are required.")
      return
    }
    const supabase = createClient()
    const payload = {
      question: editFaq.question.trim(),
      answer: editFaq.answer.trim(),
      category: editFaq.category?.trim() || "General",
      position:
        typeof editFaq.position === "number" && Number.isFinite(editFaq.position)
          ? editFaq.position
          : 0,
      published: editFaq.published !== false,
      updated_at: new Date().toISOString(),
    }
    let error
    if (faqIsNew) {
      const result = await supabase.from("faq_entries").insert(payload).select().single()
      error = result.error
      if (!error && result.data) {
        setFaqs((current) =>
          [...(current ?? []), result.data as FaqRow].sort(
            (a, b) => a.position - b.position
          )
        )
      }
    } else {
      const result = await supabase
        .from("faq_entries")
        .update(payload)
        .eq("id", editFaq.id!)
      error = result.error
      if (!error) {
        setFaqs((current) =>
          (current ?? []).map((row) =>
            row.id === editFaq.id ? { ...row, ...payload } : row
          )
        )
      }
    }
    if (error) {
      setNotice(`Could not save FAQ: ${error.message}`)
      return
    }
    setNotice(null)
    setEditFaq(null)
    setFaqIsNew(false)
  }

  const deleteFaq = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("faq_entries").delete().eq("id", id)
    if (error) {
      setNotice(`Could not delete FAQ: ${error.message}`)
      return
    }
    setNotice(null)
    setFaqs((current) => (current ?? []).filter((row) => row.id !== id))
  }

  const stats = [
    { label: "Legal topics", value: "8", icon: Scale },
    {
      label: "Document templates",
      value: String(Object.keys(DOCUMENT_TITLES).length),
      icon: FileText,
    },
    { label: "Registered users", value: users ? String(users.length) : "…", icon: Users },
    {
      label: "Documents generated",
      value: genCount !== null ? String(genCount) : "…",
      icon: LayoutDashboard,
    },
  ]

  const sourceTitle = (id: string) =>
    sources.find((row) => row.id === id)?.title ?? id
  const userEmail = (id: string) =>
    users?.find((row) => row.id === id)?.email ?? id.slice(0, 8)

  if (!liveReady) {
    return <p className="text-sm text-slate-500">Loading admin panel…</p>
  }
  if (!isAdmin) {
    return (
      <p className="text-sm text-slate-500">
        Sign in on this device with the admin account ({ADMIN_EMAIL}) to load
        live moderation data.
      </p>
    )
  }

  return (
    <div>
      <p className="max-w-3xl text-slate-600">
        Live overview of moderation, feedback, document generations, users, FAQ
        content and the legal repository — every number and row below is read
        from the production database.
      </p>

      {notice ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {notice}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="card-gradient rounded-xl border p-6 shadow-sm"
            >
              <Icon
                className="mb-3 h-5 w-5 text-slate-400"
                aria-hidden="true"
              />
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-600">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className={`${cardClassName} mt-8`}>
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Flag className="h-4 w-4 text-[#e5342b]" aria-hidden="true" />
          Moderation queue
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Flagged sessions from blocked keywords or rapid-fire requests.
        </p>
        {flags.length === 0 ? (
          <p className="text-sm text-slate-500">No flagged sessions. 🎉</p>
        ) : (
          <div className="space-y-3">
            {flags.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">{row.reason}</p>
                  <p className="truncate text-xs text-slate-500">
                    “{row.snippet}” · flags: {row.flag_count} ·{" "}
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {row.status}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void updateFlag(row.id, "reviewed")}
                    className="h-8 text-xs"
                  >
                    Review
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void updateFlag(row.id, "dismissed")}
                    className="h-8 text-xs"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={cardClassName}>
          <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <MessageSquare
              className="h-4 w-4 text-[#e5342b]"
              aria-hidden="true"
            />
            User feedback
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            “Was this helpful?” responses from chat and document generation.
          </p>
          {feedback.length === 0 ? (
            <p className="text-sm text-slate-500">No feedback yet.</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {feedback.map((row) => (
                <div
                  key={row.id}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <p className="flex items-center gap-2">
                    <span
                      className={
                        row.helpful
                          ? "font-semibold text-emerald-600"
                          : "font-semibold text-red-600"
                      }
                    >
                      {row.helpful ? "👍" : "👎"} {row.context}
                    </span>
                    {row.reason ? (
                      <span className="text-xs text-slate-500">
                        {row.reason}
                      </span>
                    ) : null}
                  </p>
                  {row.comment ? (
                    <p className="text-xs text-slate-600">{row.comment}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={cardClassName}>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Admin capabilities
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            <li>Add and edit legal sources &amp; provisions</li>
            <li>Review generated documents</li>
            <li>Review flagged sessions (Review / Dismiss)</li>
            <li>Review user feedback</li>
            <li>Manage FAQ content</li>
            <li>Disable abusive users (ban / unban)</li>
          </ul>
        </div>
      </div>

      <div className={`${cardClassName} mt-8`}>
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FileText className="h-4 w-4 text-[#e5342b]" aria-hidden="true" />
          Generated documents
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          The {genCount ?? "…"} most recent document generations across all
          users (metadata only — document text is never stored).
        </p>
        {generations.length === 0 ? (
          <p className="text-sm text-slate-500">No documents generated yet.</p>
        ) : (
          <div className="space-y-2">
            {generations.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">
                    {DOCUMENT_TITLES[row.doc_type] ?? row.doc_type}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {userEmail(row.user_id)} ·{" "}
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    row.validation_status === "passed"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {row.validation_status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`${cardClassName} mt-8`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Users className="h-4 w-4 text-[#e5342b]" aria-hidden="true" />
              Registered users
            </h2>
            <p className="text-sm text-slate-500">
              Ban blocks sign-in for 7 days; unban restores it immediately.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void loadUsers()}
            className="h-8 text-xs"
          >
            Refresh
          </Button>
        </div>
        {usersError ? (
          <p className="text-sm text-red-700">{usersError}</p>
        ) : !users ? (
          <p className="text-sm text-slate-500">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-500">No users yet.</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">
                    {user.email}
                    {user.email === ADMIN_EMAIL ? (
                      <span className="ml-2 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                        admin
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">
                    joined {new Date(user.created_at).toLocaleDateString()}
                    {user.last_sign_in_at
                      ? ` · last sign-in ${new Date(user.last_sign_in_at).toLocaleString()}`
                      : " · never signed in"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {user.banned ? (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                      banned
                    </span>
                  ) : null}
                  {user.email === ADMIN_EMAIL ? null : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={banBusy === user.id}
                      onClick={() => void toggleUserBan(user)}
                      className="h-8 text-xs"
                    >
                      <Ban className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                      {banBusy === user.id
                        ? "Working…"
                        : user.banned
                          ? "Unban"
                          : "Ban 7d"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`${cardClassName} mt-8`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Scale className="h-4 w-4 text-[#e5342b]" aria-hidden="true" />
              Legal repository
            </h2>
            <p className="text-sm text-slate-500">
              {sources.length} sources · {provisions.length} provisions — the
              same rows the Ask answers are grounded to.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSourceIsNew(true)
              setEditSource({
                title: "",
                citation: "",
                publisher: "",
                source_url: "",
                verification_status: "sourced-pending-fulltext-check",
              })
            }}
            className="h-8 text-xs"
          >
            <Plus className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
            Add source
          </Button>
        </div>

        {editSource ? (
          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-800">
              {sourceIsNew ? "New source" : `Editing: ${editSource.title}`}
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className={labelClassName}>Title</label>
                <input
                  className={inputClassName}
                  value={editSource.title ?? ""}
                  onChange={(event) =>
                    setEditSource((row) => ({ ...row, title: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClassName}>Citation</label>
                <input
                  className={inputClassName}
                  value={editSource.citation ?? ""}
                  onChange={(event) =>
                    setEditSource((row) => ({
                      ...row,
                      citation: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className={labelClassName}>Publisher</label>
                <input
                  className={inputClassName}
                  value={editSource.publisher ?? ""}
                  onChange={(event) =>
                    setEditSource((row) => ({
                      ...row,
                      publisher: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className={labelClassName}>Source URL</label>
                <input
                  className={inputClassName}
                  value={editSource.source_url ?? ""}
                  onChange={(event) =>
                    setEditSource((row) => ({
                      ...row,
                      source_url: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className={labelClassName}>Verification status</label>
                <input
                  className={inputClassName}
                  value={editSource.verification_status ?? ""}
                  onChange={(event) =>
                    setEditSource((row) => ({
                      ...row,
                      verification_status: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => void saveSource()}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditSource(null)
                  setSourceIsNew(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          {sources.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800">{row.title}</p>
                <p className="truncate text-xs text-slate-500">
                  {row.citation} · {row.verification_status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSourceIsNew(false)
                    setEditSource({ ...row })
                  }}
                  className="h-8 text-xs"
                >
                  <Pencil className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void deleteSource(row.id)}
                  className="h-8 text-xs"
                >
                  <Trash2 className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="mb-1 text-base font-semibold text-slate-900">
                Provisions
              </h3>
              <p className="text-sm text-slate-500">
                Sections and articles cited inside generated documents.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setProvIsNew(true)
                setEditProv({
                  source_id: sources[0]?.id ?? "",
                  article_or_section: "",
                  heading: "",
                  summary: "",
                })
              }}
              className="h-8 text-xs"
            >
              <Plus className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
              Add provision
            </Button>
          </div>

          {editProv ? (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">
                {provIsNew ? "New provision" : `Editing: ${editProv.article_or_section}`}
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className={labelClassName}>Source</label>
                  <select
                    className={inputClassName}
                    value={editProv.source_id ?? ""}
                    onChange={(event) =>
                      setEditProv((row) => ({
                        ...row,
                        source_id: event.target.value,
                      }))
                    }
                  >
                    {sources.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClassName}>Section / article</label>
                  <input
                    className={inputClassName}
                    value={editProv.article_or_section ?? ""}
                    onChange={(event) =>
                      setEditProv((row) => ({
                        ...row,
                        article_or_section: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClassName}>Heading</label>
                  <input
                    className={inputClassName}
                    value={editProv.heading ?? ""}
                    onChange={(event) =>
                      setEditProv((row) => ({
                        ...row,
                        heading: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClassName}>Summary</label>
                  <textarea
                    className={inputClassName}
                    rows={3}
                    value={editProv.summary ?? ""}
                    onChange={(event) =>
                      setEditProv((row) => ({
                        ...row,
                        summary: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => void saveProvision()}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditProv(null)
                    setProvIsNew(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            {provisions.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">
                    {row.article_or_section} — {row.heading}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {sourceTitle(row.source_id)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setProvIsNew(false)
                      setEditProv({ ...row })
                    }}
                    className="h-8 text-xs"
                  >
                    <Pencil className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void deleteProvision(row.id)}
                    className="h-8 text-xs"
                  >
                    <Trash2 className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`${cardClassName} mt-8`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-[#e5342b]" aria-hidden="true" />
              FAQ content
            </h2>
            <p className="text-sm text-slate-500">
              Published entries appear on the public /faq page.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFaqIsNew(true)
              setEditFaq({
                question: "",
                answer: "",
                category: "General",
                position: (faqs ?? []).length,
                published: true,
              })
            }}
            className="h-8 text-xs"
          >
            <Plus className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
            Add FAQ
          </Button>
        </div>

        {faqError ? (
          <p className="text-sm text-amber-700">{faqError}</p>
        ) : faqs === null ? (
          <p className="text-sm text-slate-500">Loading FAQs…</p>
        ) : faqs.length === 0 ? (
          <p className="text-sm text-slate-500">No FAQ entries yet.</p>
        ) : null}

        {editFaq ? (
          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-800">
              {faqIsNew ? "New FAQ" : "Edit FAQ"}
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClassName}>Question</label>
                <input
                  className={inputClassName}
                  value={editFaq.question ?? ""}
                  onChange={(event) =>
                    setEditFaq((row) => ({
                      ...row,
                      question: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClassName}>Answer</label>
                <textarea
                  className={inputClassName}
                  rows={4}
                  value={editFaq.answer ?? ""}
                  onChange={(event) =>
                    setEditFaq((row) => ({ ...row, answer: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClassName}>Category</label>
                <input
                  className={inputClassName}
                  value={editFaq.category ?? ""}
                  onChange={(event) =>
                    setEditFaq((row) => ({
                      ...row,
                      category: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className={labelClassName}>Position</label>
                <input
                  type="number"
                  className={inputClassName}
                  value={typeof editFaq.position === "number" ? editFaq.position : 0}
                  onChange={(event) =>
                    setEditFaq((row) => ({
                      ...row,
                      position: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={editFaq.published !== false}
                  onChange={(event) =>
                    setEditFaq((row) => ({
                      ...row,
                      published: event.target.checked,
                    }))
                  }
                />
                Published (visible to everyone)
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => void saveFaq()}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditFaq(null)
                  setFaqIsNew(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {faqs && faqs.length > 0 ? (
          <div className="space-y-2">
            {faqs.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">
                    {row.position}. {row.question}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {row.category} ·{" "}
                    {row.published ? (
                      <span className="text-emerald-600">published</span>
                    ) : (
                      <span className="text-amber-600">draft</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFaqIsNew(false)
                      setEditFaq({ ...row })
                    }}
                    className="h-8 text-xs"
                  >
                    <Pencil className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void deleteFaq(row.id)}
                    className="h-8 text-xs"
                  >
                    <Trash2 className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
