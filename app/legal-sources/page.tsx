import Link from "next/link"
import {
  AlertTriangle,
  BookMarked,
  CheckCircle2,
  ExternalLink,
  Scale,
} from "lucide-react"
import PageShell from "@/components/layout/PageShell"
import { getLegalProvisions, getLegalSources } from "@/lib/legal-store"
import { checkSourcesForStaleness } from "@/lib/source-maintenance"

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Legal Sources",
  "The Kenyan Acts and provisions that ground HAKI AI answers and generated documents.",
  "/legal-sources"
);

export default async function LegalSourcesPage() {
  const [sources, provisions] = await Promise.all([
    getLegalSources(),
    getLegalProvisions(),
  ])
  const maintenance = checkSourcesForStaleness(sources)
  const stale = maintenance.filter((item) => item.stale)

  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        Verified Legal Sources
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        HAKI AI generates legal documents only from fixed templates plus
        authorities retrieved from this verified repository of Kenyan legal
        sources. Every citation in a generated document must trace back to a
        provision below — anything else is rejected by automated citation
        validation.
      </p>

      <div
        className={`mt-6 flex max-w-4xl items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed ${
          stale.length > 0
            ? "border-amber-200 bg-amber-50 text-amber-900"
            : "border-emerald-200 bg-emerald-50 text-emerald-900"
        }`}
      >
        {stale.length > 0 ? (
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />
        ) : (
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />
        )}
        <p>
          {stale.length === 0
            ? `All ${sources.length} sources are within their re-verification window.`
            : `${stale.length} of ${sources.length} sources are due for re-verification against the official source: ${stale.map((item) => item.title).join("; ")}.`}{" "}
          Sources are re-checked periodically for amendments, repeals, and new
          editions. Checks are append-only — a previously used legal version is
          never silently replaced.
        </p>
      </div>

      <h2 className="mt-10 flex items-center gap-2 text-xl font-bold text-slate-900">
        <Scale className="h-5 w-5 text-[#c0221b]" aria-hidden="true" />
        Sources ({sources.length})
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {sources.map((source) => {
          const items = provisions.filter(
            (provision) => provision.sourceId === source.id
          )
          return (
            <article
              key={source.id}
              className="card-gradient rounded-xl border p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {source.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {source.citation} · {source.jurisdiction}
              </p>
              <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
                <div>
                  <dt className="font-semibold text-slate-800">Publisher</dt>
                  <dd>{source.publisher}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-800">Publication</dt>
                  <dd>{source.publicationDetails}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-800">
                    Effective date
                  </dt>
                  <dd>{source.effectiveDate}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-800">Verification</dt>
                  <dd>
                    <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-xs font-semibold">
                      {source.verificationStatus}
                    </span>{" "}
                    <span className="text-xs text-slate-500">
                      version {source.version} · last checked{" "}
                      {source.lastCheckedAt || "not recorded"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-800">Licence</dt>
                  <dd className="text-xs">{source.licenseNote}</dd>
                </div>
              </dl>
              <Link
                href={source.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#c0221b] underline underline-offset-2"
              >
                View on Kenya Law
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>

              {items.length > 0 ? (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    <BookMarked className="h-3.5 w-3.5" aria-hidden="true" />
                    Searchable provisions ({items.length})
                  </p>
                  <ul className="mt-2 space-y-2">
                    {items.map((provision) => (
                      <li
                        key={provision.id}
                        className="rounded-lg bg-white/70 p-3 text-sm"
                      >
                        <p className="font-semibold text-slate-800">
                          {provision.articleOrSection} — {provision.heading}
                        </p>
                        <p className="mt-0.5 text-slate-600">
                          {provision.summary}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Supports: {provision.docTypes.join(", ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          )
        })}
      </div>

      <div className="mt-10 max-w-4xl rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">
          How grounding works
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Identify the document type and legal issues in the request.</li>
          <li>Search this repository with keyword and semantic retrieval.</li>
          <li>
            Accept a provision as evidence only if it allowlists the document
            type, shares keyword overlap, and passes authority/date checks —
            semantic similarity alone is never enough.
          </li>
          <li>Generate from the fixed template plus the retrieved evidence.</li>
          <li>
            Validate every citation against the evidence before export; reject
            or flag anything unsupported, including invented quotations and
            court cases.
          </li>
        </ol>
        <p className="mt-3">
          Missing facts are flagged, never guessed. Provisions needing a
          lawyer&apos;s confirmation are marked for advocate review. The
          Constitution is cited only when actually retrieved for the document —
          never by default.
        </p>
      </div>
    </PageShell>
  )
}
