// Periodic maintenance process for the verified legal source repository.
//
// Official sources (Kenya Law) change: amendments, repeals, new
// legislation, revised editions. This module decides WHICH sources need a
// human re-check and records the outcome via legal-store.recordSourceCheck().
// History is append-only: a check never silently replaces the previously
// used legal version — it adds a legal_source_versions row and bumps the
// source version counter.

import type { LegalSource } from "@/lib/legal-sources"

export const STALE_AFTER_DAYS = 180

export interface MaintenanceItem {
  sourceId: string
  title: string
  sourceUrl: string
  lastCheckedAt: string
  daysSinceCheck: number
  stale: boolean
  reason: string
}

export function daysSince(isoDate: string, now: Date = new Date()): number {
  const then = new Date(isoDate).getTime()
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY
  return Math.floor((now.getTime() - then) / (1000 * 60 * 60 * 24))
}

/**
 * Flag sources due for re-verification against the official source:
 * past the staleness threshold, never checked, or explicitly marked
 * stale-needs-recheck. withdrawn/superseded sources are reported so an
 * editor replaces them rather than citing them.
 */
export function checkSourcesForStaleness(
  sources: LegalSource[],
  now: Date = new Date(),
  staleAfterDays: number = STALE_AFTER_DAYS
): MaintenanceItem[] {
  return sources.map((source) => {
    const age = daysSince(source.lastCheckedAt, now)
    const explicitlyStale =
      source.verificationStatus === "stale-needs-recheck" ||
      source.verificationStatus === "withdrawn" ||
      source.verificationStatus === "superseded"
    const stale = explicitlyStale || age > staleAfterDays
    const reason = explicitlyStale
      ? `Status is "${source.verificationStatus}" — editor action required.`
      : age === Number.POSITIVE_INFINITY
        ? "No recorded check date — verify against the official source."
        : age > staleAfterDays
          ? `Last checked ${age} days ago (threshold ${staleAfterDays} days) — re-verify for amendments, repeals, or new editions.`
          : `Current — last checked ${age} days ago.`
    return {
      sourceId: source.id,
      title: source.title,
      sourceUrl: source.sourceUrl,
      lastCheckedAt: source.lastCheckedAt,
      daysSinceCheck: age,
      stale,
      reason,
    }
  })
}
