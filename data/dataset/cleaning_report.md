# HAKI AI - Legal Dataset Cleaning Report

Generated: 2026-11-21 19:02:44

- Raw sources: `data/dataset/legal_sources.csv`
- Raw provisions: `data/dataset/legal_provisions.csv`
- Application source of truth: `lib/legal-sources.ts`
- Cleaned output directory: `data/dataset/cleaned`

## Summary

| Dataset | Rows in | Rows out | Added | Dropped | Quarantined |
| --- | ---: | ---: | ---: | ---: | ---: |
| legal_sources | 7 | 7 | 0 | 0 | 0 |
| legal_provisions | 21 | 22 | 1 | 0 | 0 |

**Result:** 0 error(s), 7 warning(s), 0 cell(s) normalised. The raw extract was reconciled against `lib/legal-sources.ts`: 1 record(s) added and 6 field value(s) refreshed.

## Quality checks

| Check | Sources | Provisions |
| --- | --- | --- |
| Required fields | PASS | PASS |
| ISO dates | PASS | PASS |
| HTTPS Kenya Law URLs | PASS | PASS |
| Verification status enum | PASS | PASS |
| Unique primary keys | PASS | PASS |
| Source-of-truth reconciliation | 0 added | 1 added |
| Source-of-truth coverage | 7/7 | 22/22 |
| Referential integrity | 7 sources | 22/22 linked |

## Normalisation changes

No normalisation changes were required; the raw values already matched the canonical format.

## Source-of-truth reconciliation

- Sources in `lib/legal-sources.ts`: 7
- Provisions in `lib/legal-sources.ts`: 22
- Added from source of truth: 0 source(s), 1 provision(s)
- Field mismatches corrected: 6

Added records:

- `provision: emp-s19-20-payment`

## Values refreshed from the source of truth

| Dataset | Row | Field | Before | After |
| --- | --- | --- | --- | --- |
| provisions | emp-s35-service-pay | keywords | service pay; gratuity; severance; terminal dues | service pay; gratuity; severance; terminal dues; salary; wages; final pay; unpaid dues |
| provisions | emp-s35-service-pay | doc_types | employment-contract; demand-letter | employment-contract; demand-letter; salary-claim |
| provisions | emp-s41-termination | doc_types | employment-contract; complaint-letter | employment-contract; complaint-letter; salary-claim |
| provisions | emp-s49-remedies | keywords | remedies; compensation; reinstatement; damages; wrongful dismissal | remedies; compensation; reinstatement; damages; wrongful dismissal; salary; wages; final pay |
| provisions | emp-s49-remedies | doc_types | employment-contract; complaint-letter; demand-letter | employment-contract; complaint-letter; demand-letter; salary-claim |
| provisions | rr-scope | keywords | dwelling; residential; rent restriction; standard rent; possession; premium; tenant; landlord; rent | dwelling; residential; rent restriction; standard rent; possession; premium; tenant; landlord; rent; deposit; security deposit; deposit refund |

## Issues

| Severity | Dataset | Row | Field | Issue | Action |
| --- | --- | --- | --- | --- | --- |
| WARNING | provisions | emp-s19-20-payment | provision_id | Missing from raw extract but present in application source of truth | Added from lib/legal-sources.ts |
| WARNING | provisions | emp-s35-service-pay | keywords | Value differs from lib/legal-sources.ts | Replaced with source-of-truth value |
| WARNING | provisions | emp-s35-service-pay | doc_types | Value differs from lib/legal-sources.ts | Replaced with source-of-truth value |
| WARNING | provisions | emp-s41-termination | doc_types | Value differs from lib/legal-sources.ts | Replaced with source-of-truth value |
| WARNING | provisions | emp-s49-remedies | keywords | Value differs from lib/legal-sources.ts | Replaced with source-of-truth value |
| WARNING | provisions | emp-s49-remedies | doc_types | Value differs from lib/legal-sources.ts | Replaced with source-of-truth value |
| WARNING | provisions | rr-scope | keywords | Value differs from lib/legal-sources.ts | Replaced with source-of-truth value |

## Output files

- `data/dataset/cleaned/legal_sources_clean.csv`
- `data/dataset/cleaned/legal_provisions_clean.csv`
- `data/dataset/cleaned/legal_dataset.json`
- `data/dataset/cleaned/cleaning_issues.csv`
- `data/dataset/cleaning_report.md`

## Reproduce

```powershell
python scripts/clean_legal_dataset.py
```
