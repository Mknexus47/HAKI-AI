// Verified legal source repository for HAKI AI (source-grounded generation).
//
// Design constraints (see task spec):
// - HAKI AI must never invent legal authorities, sections, articles,
//   quotations, or statutory requirements from model knowledge.
// - Every citation emitted in a generated document must resolve to a
//   provision in THIS repository, and every provision links back to an
//   official Kenyan source (Kenya Law) with title, section/article,
//   publication details, effective date, source URL, and verification
//   status.
// - The repository stores concise descriptive summaries plus deep links.
//   The full authoritative text remains on Kenya Law; HAKI AI does not
//   redistribute full Acts. Respect the licence note on each source page
//   (legislative content: no copyright; Kenya Law PDF copies are licensed
//   CC BY-NC-SA 4.0).
// - `verbatimQuote` is null for every seeded provision: no verbatim legal
//   text is stored, so the generator can never emit a "quotation". If a
//   future ingestion pipeline stores verified verbatim text, it must set
//   `verbatimQuote` AND `verificationStatus: "verified"` together.

export type VerificationStatus =
  | "verified"
  | "sourced-pending-fulltext-check"
  | "stale-needs-recheck"
  | "superseded"
  | "withdrawn"

export interface LegalSource {
  id: string
  title: string
  citation: string
  jurisdiction: string
  publisher: string
  publicationDetails: string
  effectiveDate: string // ISO date the law commenced / was promulgated
  sourceUrl: string // working Kenya Law link
  licenseNote: string
  verificationStatus: VerificationStatus
  version: number // repository version — never silently replaced, see versions table
  lastCheckedAt: string // ISO date the source link/content was last checked
  retrievedAt: string // ISO date this record was entered
}

export interface LegalProvision {
  id: string
  sourceId: string
  articleOrSection: string // e.g. "Section 28" or descriptive label where the
  // exact numbering must still be confirmed in the source text
  heading: string
  summary: string // descriptive summary — NOT a quotation
  contextNote: string // surrounding context / where to confirm in the source
  keywords: string[]
  docTypes: string[] // document types this provision may support
  verificationStatus: VerificationStatus
  sourceUrl: string // deep link to the source on Kenya Law
  retrievedAt: string
  verbatimQuote: string | null // null => generator must not emit quotations
}

export const LEGAL_SOURCES: LegalSource[] = [
  {
    id: "constitution-ke-2010",
    title: "Constitution of Kenya, 2010",
    citation: "Constitution of Kenya, 2010",
    jurisdiction: "Kenya",
    publisher: "National Council for Law Reporting (Kenya Law)",
    publicationDetails:
      "Published in Kenya Gazette Vol. CXII—No. 88 on 3 September 2010; assented to 4 August 2010; promulgated 27 August 2010.",
    effectiveDate: "2010-08-27",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2010/constitution",
    licenseNote:
      "Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.",
    verificationStatus: "sourced-pending-fulltext-check",
    version: 1,
    lastCheckedAt: "2026-10-12",
    retrievedAt: "2026-10-12",
  },
  {
    id: "employment-act-2007",
    title: "Employment Act, 2007",
    citation: "Act No. 11 of 2007",
    jurisdiction: "Kenya",
    publisher: "National Council for Law Reporting (Kenya Law)",
    publicationDetails:
      "Act No. 11 of 2007; legislation as at 31 December 2022 (Kenya Law revision).",
    effectiveDate: "2008-06-02",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31",
    licenseNote:
      "Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.",
    verificationStatus: "sourced-pending-fulltext-check",
    version: 1,
    lastCheckedAt: "2026-10-12",
    retrievedAt: "2026-10-12",
  },
  {
    id: "consumer-protection-act-2012",
    title: "Consumer Protection Act, 2012",
    citation: "Cap. 501",
    jurisdiction: "Kenya",
    publisher: "National Council for Law Reporting (Kenya Law)",
    publicationDetails:
      "Cap. 501; published in Kenya Gazette Vol. CXV—No. 3 on 11 January 2013; assented to 13 December 2012; commenced 14 March 2013.",
    effectiveDate: "2013-03-14",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2012/46/eng@2022-12-31",
    licenseNote:
      "Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.",
    verificationStatus: "sourced-pending-fulltext-check",
    version: 1,
    lastCheckedAt: "2026-10-12",
    retrievedAt: "2026-10-12",
  },
  {
    id: "law-of-contract-act",
    title: "Law of Contract Act",
    citation: "Cap. 23",
    jurisdiction: "Kenya",
    publisher: "National Council for Law Reporting (Kenya Law)",
    publicationDetails:
      "Cap. 23; assented to 25 November 1960; commenced 1 January 1961; legislation as at 31 December 2022.",
    effectiveDate: "1961-01-01",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/1960/43/eng@2022-12-31",
    licenseNote:
      "Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.",
    verificationStatus: "sourced-pending-fulltext-check",
    version: 1,
    lastCheckedAt: "2026-10-12",
    retrievedAt: "2026-10-12",
  },
  {
    id: "rent-restriction-act",
    title: "Rent Restriction Act",
    citation: "Cap. 296",
    jurisdiction: "Kenya",
    publisher: "National Council for Law Reporting (Kenya Law)",
    publicationDetails:
      "Cap. 296; assented to 24 August 1959; commenced 1 October 1959.",
    effectiveDate: "1959-10-01",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/1959/35",
    licenseNote:
      "Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.",
    verificationStatus: "sourced-pending-fulltext-check",
    version: 1,
    lastCheckedAt: "2026-10-12",
    retrievedAt: "2026-10-12",
  },
  {
    id: "landlord-tenant-shops-act",
    title:
      "Landlord and Tenant (Shops, Hotels and Catering Establishments) Act",
    citation: "Cap. 301 (Act No. 13 of 1965)",
    jurisdiction: "Kenya",
    publisher: "National Council for Law Reporting (Kenya Law)",
    publicationDetails:
      "Cap. 301; Act No. 13 of 1965; assented to 4 June 1965; commenced 1 November 1965; legislation as at 31 December 2022.",
    effectiveDate: "1965-11-01",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/1965/13/eng@2022-12-31",
    licenseNote:
      "Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.",
    verificationStatus: "sourced-pending-fulltext-check",
    version: 1,
    lastCheckedAt: "2026-10-12",
    retrievedAt: "2026-10-12",
  },
  {
    id: "oaths-statutory-declarations-act",
    title: "Oaths and Statutory Declarations Act",
    citation: "Cap. 15",
    jurisdiction: "Kenya",
    publisher: "National Council for Law Reporting (Kenya Law)",
    publicationDetails:
      "Cap. 15; legislation as at 26 April 2024 (as amended by the Statute Law (Miscellaneous Amendments) Act, 2024).",
    effectiveDate: "1926-01-01",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/1926/29/eng@2024-04-26",
    licenseNote:
      "Legislative content carries no copyright; Kenya Law PDF copies are licensed CC BY-NC-SA 4.0 — see source page.",
    verificationStatus: "sourced-pending-fulltext-check",
    version: 1,
    lastCheckedAt: "2026-10-12",
    retrievedAt: "2026-10-12",
  },
]

export const LEGAL_PROVISIONS: LegalProvision[] = [
  // ---- Constitution of Kenya, 2010 (cited ONLY when retrieved — never by default)
  {
    id: "const-a2-supremacy",
    sourceId: "constitution-ke-2010",
    articleOrSection: "Article 2",
    heading: "Supremacy of the Constitution",
    summary:
      "Establishes the Constitution as the supreme law; any law inconsistent with it is void to the extent of the inconsistency.",
    contextNote:
      "Chapter One. Confirm the article text on the Kenya Law page before relying on it.",
    keywords: ["constitution", "constitutional", "supremacy", "supreme law"],
    docTypes: ["employment-contract", "tenancy-agreement"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2010/constitution",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "const-a41-fair-labour",
    sourceId: "constitution-ke-2010",
    articleOrSection: "Article 41",
    heading: "Labour relations — fair labour practices",
    summary:
      "Guarantees fair labour practices and related labour rights. Confirm the current article text on Kenya Law; do not restate its wording from memory.",
    contextNote:
      "Bill of Rights. Retrieved only when the user's matter squarely concerns labour rights.",
    keywords: [
      "fair labour",
      "labour rights",
      "fair practices",
      "workers rights",
    ],
    docTypes: ["employment-contract"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2010/constitution",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  // ---- Employment Act, 2007
  {
    id: "emp-s27-hours",
    sourceId: "employment-act-2007",
    articleOrSection: "Section 27",
    heading: "Hours of work and rest days",
    summary:
      "Regulates employees' working hours and rest-day entitlements. Confirm current thresholds in the source text.",
    contextNote: "Part on basic conditions of employment.",
    keywords: ["hours", "working hours", "overtime", "rest day", "work week"],
    docTypes: ["employment-contract"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "emp-s28-leave",
    sourceId: "employment-act-2007",
    articleOrSection: "Section 28",
    heading: "Annual leave",
    summary:
      "Provides for minimum annual leave entitlements after twelve consecutive months of service. Confirm current thresholds in the source text.",
    contextNote: "Part on basic conditions of employment.",
    keywords: ["leave", "annual leave", "holiday", "vacation", "rest"],
    docTypes: ["employment-contract"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "emp-s35-service-pay",
    sourceId: "employment-act-2007",
    articleOrSection: "Section 35(5) (see source for subsection)",
    heading: "Service pay on termination in specified cases",
    summary:
      "Addresses service pay rates where that section applies. Confirm applicability and current rates in the source text.",
    contextNote:
      "Termination provisions. Applicability is conditional — confirm against the source.",
    keywords: ["service pay", "gratuity", "severance", "terminal dues"],
    docTypes: ["employment-contract", "demand-letter"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "emp-s41-termination",
    sourceId: "employment-act-2007",
    articleOrSection: "Sections 41, 43 and 45 (see source)",
    heading: "Fair reason and fair procedure before termination",
    summary:
      "Requires a valid reason and fair procedure before termination; the employer must prove the reason. Confirm the sections in the source text.",
    contextNote: "Termination and dismissal provisions.",
    keywords: [
      "termination",
      "dismissal",
      "dismissed",
      "fired",
      "unfair termination",
      "notice",
      "summary dismissal",
    ],
    docTypes: ["employment-contract", "complaint-letter"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "emp-s49-remedies",
    sourceId: "employment-act-2007",
    articleOrSection: "Section 49 (see source)",
    heading: "Remedies for wrongful dismissal and unfair termination",
    summary:
      "Sets the remedies available for wrongful dismissal and unfair termination. Confirm the list of remedies in the source text.",
    contextNote:
      "Remedies provisions guiding the Employment and Labour Relations Court.",
    keywords: [
      "remedies",
      "compensation",
      "reinstatement",
      "damages",
      "wrongful dismissal",
    ],
    docTypes: ["employment-contract", "complaint-letter", "demand-letter"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "emp-s51-certificate",
    sourceId: "employment-act-2007",
    articleOrSection: "Section 51 (see source)",
    heading: "Certificate of service",
    summary:
      "Provides for issuance of a certificate of service. Confirm the wording in the source text.",
    contextNote: "Post-employment provisions.",
    keywords: ["certificate of service", "reference", "clearance"],
    docTypes: ["employment-contract"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "emp-s6-harassment-policy",
    sourceId: "employment-act-2007",
    articleOrSection: "Section 6 (see source)",
    heading: "Policy statement on sexual harassment",
    summary:
      "Requires qualifying employers to issue a policy statement on sexual harassment. Confirm the employer threshold and form in the source text.",
    contextNote:
      "Employee rights provisions; detailed forms sit in subsidiary rules.",
    keywords: ["harassment", "policy statement", "workplace policy"],
    docTypes: ["employment-contract"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2007/11/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  // ---- Consumer Protection Act, 2012
  {
    id: "cpa-s3-purposes",
    sourceId: "consumer-protection-act-2012",
    articleOrSection: "Section 3 (purposes; see source)",
    heading: "Purposes — fair consumer market and unfair practices",
    summary:
      "Establishes the framework for a fair consumer market and protection against unconscionable, unfair or improper trade practices.",
    contextNote: "Part I – Preliminary.",
    keywords: [
      "consumer",
      "unfair practice",
      "deceptive",
      "misleading",
      "faulty",
      "refund",
      "defective",
    ],
    docTypes: ["refund-letter", "complaint-letter"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2012/46/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "cpa-rescission",
    sourceId: "consumer-protection-act-2012",
    articleOrSection: "Unfair-practice remedies (see source for numbering)",
    heading: "Rescission and remedies after an unfair practice",
    summary:
      "A consumer who enters an agreement after an unfair practice may rescind it and seek remedies available in law, including damages. Confirm the provision numbering in the source text.",
    contextNote:
      "Remedies for unfair practices. Confirm numbering before citing.",
    keywords: ["rescind", "cancel", "damages", "remedy", "unfair practice"],
    docTypes: ["refund-letter", "complaint-letter", "demand-letter"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2012/46/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "cpa-quality",
    sourceId: "consumer-protection-act-2012",
    articleOrSection: "Consumer rights and supplier obligations (see source)",
    heading: "Quality, safety and description of goods and services",
    summary:
      "Addresses goods and services that must be safe, of acceptable quality and as described, with repair, replacement or refund pathways. Confirm the operative sections in the source text.",
    contextNote:
      "Substantive consumer-rights parts. Confirm section numbers before citing.",
    keywords: [
      "quality",
      "safe",
      "as described",
      "warranty",
      "guarantee",
      "repair",
      "replacement",
      "goods",
      "services",
    ],
    docTypes: ["refund-letter", "complaint-letter"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/2012/46/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  // ---- Law of Contract Act (Cap. 23)
  {
    id: "loc-s1-title",
    sourceId: "law-of-contract-act",
    articleOrSection: "Section 1",
    heading: "Short title",
    summary: "Citation provision for the Law of Contract Act.",
    contextNote: "Preliminary.",
    keywords: ["contract", "agreement"],
    docTypes: [
      "service-agreement",
      "loan-acknowledgement",
      "tenancy-agreement",
      "employment-contract",
    ],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/1960/43/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "loc-s2-english-law",
    sourceId: "law-of-contract-act",
    articleOrSection: "Section 2",
    heading: "Application of English common law of contract",
    summary:
      "Applies the English common law of contract in Kenya with modifications; contracts in writing are not void merely for want of a seal. Confirm the text in the source.",
    contextNote: "Foundational contract provision.",
    keywords: [
      "contract",
      "enforceable",
      "seal",
      "writing",
      "signed",
      "binding",
      "loan",
      "repayment",
    ],
    docTypes: [
      "service-agreement",
      "loan-acknowledgement",
      "tenancy-agreement",
      "demand-letter",
    ],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/1960/43/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  // ---- Rent Restriction Act (Cap. 296)
  {
    id: "rr-scope",
    sourceId: "rent-restriction-act",
    articleOrSection: "Scope of application (see source for numbering)",
    heading: "Application to dwelling-houses",
    summary:
      "Applies to dwelling-houses other than excepted categories such as service tenancies. Confirm the operative section and current exceptions in the source text.",
    contextNote: "Application provisions at the start of the Act.",
    keywords: [
      "dwelling",
      "residential",
      "rent restriction",
      "standard rent",
      "possession",
      "premium",
      "tenant",
      "landlord",
      "rent",
    ],
    docTypes: ["tenancy-agreement", "rent-acknowledgement"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/1959/35",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  // ---- Landlord and Tenant (Shops, Hotels and Catering Establishments) Act (Cap. 301)
  {
    id: "lt301-s2-controlled",
    sourceId: "landlord-tenant-shops-act",
    articleOrSection: "Section 2 (interpretation; see source)",
    heading: "Controlled tenancy — meaning",
    summary:
      "Defines controlled tenancies of shops, hotels and catering establishments, covering unwritten tenancies and written tenancies within the statutory period. Confirm the definition in the source text.",
    contextNote: "Interpretation section.",
    keywords: [
      "controlled tenancy",
      "shop",
      "hotel",
      "catering",
      "commercial premises",
      "business premises",
    ],
    docTypes: ["tenancy-agreement"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/1965/13/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "lt301-s4-notice",
    sourceId: "landlord-tenant-shops-act",
    articleOrSection: "Section 4 (termination notices; see source)",
    heading: "Termination notices for controlled tenancies",
    summary:
      "Prescribes the notice procedure for terminating or altering a controlled tenancy, including minimum notice periods. Confirm the subsections in the source text.",
    contextNote: "Termination and alteration provisions.",
    keywords: [
      "notice",
      "termination of tenancy",
      "eviction notice",
      "two months notice",
      "quit",
      "vacate",
    ],
    docTypes: ["tenancy-agreement"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/1965/13/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "lt301-s12-tribunal",
    sourceId: "landlord-tenant-shops-act",
    articleOrSection: "Section 12 (see source)",
    heading: "Powers of Tribunals",
    summary:
      "Sets what the Tribunal may determine, including controlled-tenancy status and rent. Confirm the enumerations in the source text.",
    contextNote: "Tribunal provisions.",
    keywords: [
      "tribunal",
      "dispute",
      "rent tribunal",
      "business premises rent tribunal",
    ],
    docTypes: ["tenancy-agreement", "complaint-letter"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/1965/13/eng@2022-12-31",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  // ---- Oaths and Statutory Declarations Act (Cap. 15)
  {
    id: "oaths-s2-commissioners",
    sourceId: "oaths-statutory-declarations-act",
    articleOrSection: "Section 2 (see source)",
    heading: "Appointment of commissioners for oaths",
    summary:
      "Practising advocates may be appointed commissioners for oaths and may administer oaths and take affidavits anywhere in Kenya. Confirm the text in the source.",
    contextNote: "Part II – Commissioners for oaths.",
    keywords: [
      "commissioner for oaths",
      "advocate",
      "swear",
      "sworn",
      "affidavit",
      "oath",
    ],
    docTypes: ["affidavit"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/1926/29/eng@2024-04-26",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "oaths-s5-jurat",
    sourceId: "oaths-statutory-declarations-act",
    articleOrSection: "Section 5 (see source)",
    heading: "Particulars in the jurat or attestation clause",
    summary:
      "The commissioner must truly state in the jurat or attestation the place and date where the oath or affidavit is taken or made. Confirm the text in the source.",
    contextNote: "Commissioner duties provisions.",
    keywords: ["jurat", "attestation", "place", "date", "stamp", "commission"],
    docTypes: ["affidavit"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/1926/29/eng@2024-04-26",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
  {
    id: "oaths-s11-penalty",
    sourceId: "oaths-statutory-declarations-act",
    articleOrSection: "Section 11 (see source)",
    heading: "Penalty for false declaration",
    summary:
      "Prescribes penalties for false declarations. Confirm the offence and penalty text in the source.",
    contextNote: "Offences and penalties.",
    keywords: [
      "false",
      "perjury",
      "false declaration",
      "penalty",
      "offence",
      "truth",
    ],
    docTypes: ["affidavit"],
    verificationStatus: "sourced-pending-fulltext-check",
    sourceUrl: "https://kenyalaw.org/akn/ke/act/1926/29/eng@2024-04-26",
    retrievedAt: "2026-10-12",
    verbatimQuote: null,
  },
]

export function getSourceById(id: string): LegalSource | undefined {
  return LEGAL_SOURCES.find((source) => source.id === id)
}

export function getProvisionById(id: string): LegalProvision | undefined {
  return LEGAL_PROVISIONS.find((provision) => provision.id === id)
}
