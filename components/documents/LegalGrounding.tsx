"use client"

import Link from "next/link"
import {
  AlertTriangle,
  BookMarked,
  ClipboardList,
  Scale,
  ShieldAlert,
} from "lucide-react"
import type { GroundedDocument } from "@/lib/legal-generation"

export default function LegalGrounding({
  grounded,
}: {
  grounded: GroundedDocument
}) {
  const { retrieval, validation, missingInfo, advocateNotes } = grounded

  return (
    <div className="mt-8 space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Scale className="h-5 w-5 text-[#c0221b]" aria-hidden="true" />
        Legal grounding
      </h2>

      {!retrieval.sufficient || retrieval.limitationNotice ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          <p className="flex items-start gap-2 font-semibold">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            Evidence limitation
          </p>
          <p className="mt-1">
            {retrieval.limitationNotice ??
              "No applicable provision could be verified."}
          </p>
        </div>
      ) : null}

      {retrieval.evidence.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <BookMarked className="h-4 w-4 text-[#c0221b]" aria-hidden="true" />
            Verified legal references ({retrieval.evidence.length})
          </p>
          <ul className="mt-3 space-y-3">
            {retrieval.evidence.map((item) => (
              <li
                key={item.provision.id}
                className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-sm leading-relaxed"
              >
                <p className="font-semibold text-slate-900">
                  {item.source.title} ({item.source.citation}),{" "}
                  {item.provision.articleOrSection} — {item.provision.heading}
                </p>
                <p className="mt-1 text-slate-600">{item.provision.summary}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <Link
                    href={item.provision.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#c0221b] underline underline-offset-2"
                  >
                    View source on Kenya Law →
                  </Link>
                  <span className="rounded-full bg-slate-900/5 px-2 py-0.5 font-medium text-slate-600">
                    {item.provision.verificationStatus}
                  </span>
                  <span className="text-slate-500">
                    Retrieved {item.provision.retrievedAt}
                  </span>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Full authoritative text remains on Kenya Law via the links above.
            Summaries are descriptive only — not quotations. Legal issues
            detected: {retrieval.legalIssues.join(", ") || "none"}.
          </p>
        </div>
      ) : null}

      {missingInfo.length > 0 ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          <p className="flex items-center gap-2 font-semibold">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Information still needed
          </p>
          <ul className="mt-2 list-disc pl-5">
            {missingInfo.map((field) => (
              <li key={field}>{field} — not provided.</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-900">
        <p className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Advocate review required
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {advocateNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      {!validation.ok ? (
        <div className="rounded-xl border border-red-300 bg-red-100 p-4 text-sm leading-relaxed text-red-900">
          <p className="flex items-start gap-2 font-semibold">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            Citation validation failed — do not use this document yet
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {validation.findings.map((finding, index) => (
              <li key={index}>
                “{finding.excerpt}” — {finding.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-slate-500">
          Citation validation: passed — every legal citation in this document
          traces to the verified provisions above.
        </p>
      )}
    </div>
  )
}
