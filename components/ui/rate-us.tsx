"use client"

import * as React from "react"
import { Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-client"

type SubmitStatus = "idle" | "submitting" | "done" | "error"

export default function RateUs() {
  const [open, setOpen] = React.useState(false)
  const [rating, setRating] = React.useState(0)
  const [hovered, setHovered] = React.useState(0)
  const [comment, setComment] = React.useState("")
  const [status, setStatus] = React.useState<SubmitStatus>("idle")

  React.useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const close = () => {
    setOpen(false)
    setRating(0)
    setHovered(0)
    setComment("")
    setStatus("idle")
  }

  const submit = async () => {
    if (rating < 1 || status === "submitting") return
    setStatus("submitting")

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { error } = await supabase.from("ratings").insert({
        user_id: user?.id ?? null,
        rating,
        comment: comment.trim() ? comment.trim().slice(0, 500) : null,
        page: window.location.pathname,
      })
      if (error) throw error
      setStatus("done")
    } catch {
      setStatus("error")
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-amber-400 hover:text-amber-300"
      >
        <Star className="h-4 w-4" aria-hidden="true" />
        Rate us
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4"
          role="presentation"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="rate-us-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="rate-us-title" className="text-lg font-semibold">
                  Rate HAKI AI
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  How useful is the platform for you?
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close rating dialog"
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {status === "done" ? (
              <div className="mt-6">
                <p className="text-sm font-medium text-emerald-700">
                  Thank you — your rating was saved.
                </p>
                <div className="mt-5 flex justify-end">
                  <Button
                    type="button"
                    onClick={close}
                    className="btn-gradient-primary rounded-full"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="mt-6 flex items-center justify-center gap-2"
                  onMouseLeave={() => setHovered(0)}
                >
                  {[1, 2, 3, 4, 5].map((value) => {
                    const active = value <= (hovered || rating)
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        aria-pressed={rating === value}
                        onMouseEnter={() => setHovered(value)}
                        onFocus={() => setHovered(value)}
                        onBlur={() => setHovered(0)}
                        onClick={() => setRating(value)}
                        className="rounded-md p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <Star
                          className={`h-9 w-9 ${
                            active ? "text-amber-400" : "text-slate-300"
                          }`}
                          fill={active ? "currentColor" : "none"}
                          aria-hidden="true"
                        />
                      </button>
                    )
                  })}
                </div>

                <p className="mt-2 text-center text-xs text-slate-500">
                  {rating ? `${rating} out of 5` : "Tap a star to rate"}
                </p>

                <label
                  htmlFor="rate-us-comment"
                  className="mt-5 block text-sm font-medium text-slate-700"
                >
                  Anything we should improve?{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="rate-us-comment"
                  rows={3}
                  maxLength={500}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Your feedback helps us improve."
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
                />

                {status === "error" ? (
                  <p className="mt-3 text-sm text-red-600" role="alert">
                    Could not save your rating. Please try again.
                  </p>
                ) : null}

                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={close}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={rating === 0 || status === "submitting"}
                    onClick={() => void submit()}
                    className="btn-gradient-primary rounded-full"
                  >
                    {status === "submitting" ? "Saving..." : "Submit rating"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
