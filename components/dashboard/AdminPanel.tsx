"use client"

import * as React from "react"
import {
  LayoutDashboard,
  FileText,
  Scale,
  Users,
  Flag,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-client"

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

export default function AdminPanel() {
  const [liveReady, setLiveReady] = React.useState(false)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [flags, setFlags] = React.useState<FlaggedRow[]>([])
  const [feedback, setFeedback] = React.useState<FeedbackRow[]>([])

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
      const [flagRows, feedbackRows] = await Promise.all([
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
      ])
      if (cancelled) return
      setFlags((flagRows.data as FlaggedRow[]) ?? [])
      setFeedback((feedbackRows.data as FeedbackRow[]) ?? [])
    })

    return () => {
      cancelled = true
    }
  }, [])

  const updateFlag = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from("flagged_sessions").update({ status }).eq("id", id)
    setFlags((current) =>
      current.map((row) => (row.id === id ? { ...row, status } : row))
    )
  }

  const stats = [
    { label: "Legal topics", value: "8", icon: Scale },
    { label: "Document templates", value: "9", icon: FileText },
    { label: "Registered users", value: "0", icon: Users },
    { label: "Documents generated", value: "0", icon: LayoutDashboard },
  ]

  return (
    <div>
      <p className="max-w-3xl text-slate-600">
        Manage legal topics, document templates, FAQ content, and review
        generated document requests.
      </p>

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

      {/* Moderation queue */}
      <div className="card-gradient mt-8 rounded-xl border p-8 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Flag className="h-4 w-4 text-[#e5342b]" aria-hidden="true" />
          Moderation queue
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Flagged sessions from blocked keywords or rapid-fire requests.
        </p>
        {!liveReady ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : !isAdmin ? (
          <p className="text-sm text-slate-500">
            Sign in on this device with the admin account ({ADMIN_EMAIL}) to
            load live moderation data.
          </p>
        ) : flags.length === 0 ? (
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

      {/* Feedback review */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-gradient rounded-xl border p-8 shadow-sm">
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
          {!liveReady ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : !isAdmin ? (
            <p className="text-sm text-slate-500">
              Sign in with the admin account to load feedback.
            </p>
          ) : feedback.length === 0 ? (
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

        <div className="card-gradient rounded-xl border p-8 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Admin capabilities
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            <li>Add and edit legal topics</li>
            <li>Add and edit document templates</li>
            <li>Review flagged sessions (Review / Dismiss)</li>
            <li>Review user feedback</li>
            <li>Manage FAQ content</li>
            <li>Disable abusive users</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
