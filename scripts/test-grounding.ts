// Acceptance tests for source-grounded legal document generation.
// Run: npm run test:grounding  (npx tsx scripts/test-grounding.ts)
//
// Covers the spec acceptance criteria across tenancy agreements, employment
// documents, demand letters, affidavits, and every other supported type:
//  - every generation validates clean (no fabricated citations)
//  - every cited authority resolves to the verified repository
//  - fabricated sections / quotations / court cases are rejected
//  - insufficient evidence yields a limitation notice, never invented law
//  - the Constitution is cited only when actually retrieved
//  - DOCX export produces a valid package; maintenance flags stale sources

import { buildDocx } from "@/lib/docx"
import {
  generateGroundedDocument,
  validateCitations,
} from "@/lib/legal-generation"
import { getProvisionById } from "@/lib/legal-sources"
import { retrieveLegalEvidence } from "@/lib/legal-retrieval"
import { checkSourcesForStaleness } from "@/lib/source-maintenance"
import { LEGAL_SOURCES } from "@/lib/legal-sources"

const TODAY = "12 October 2026"

const SAMPLES: Array<{ docType: string; form: Record<string, string> }> = [
  {
    docType: "demand-letter",
    form: {
      sender: "Amina Noor",
      phone: "0712345678",
      recipient: "Brian Otieno",
      issue: "Unpaid terminal dues and service pay",
      amount: "85000",
      dueDate: "2026-09-01",
      action: "Full payment of the amount owed",
      deadline: "7",
    },
  },
  {
    docType: "rent-acknowledgement",
    form: {
      landlord: "Cynthia Wanjiru",
      tenant: "David Mwangi",
      property: "House C2, Kileleshwa, Nairobi",
      amount: "45000",
      period: "October 2026",
      receiptDate: "12 October 2026",
    },
  },
  {
    docType: "service-agreement",
    form: {
      partyA: "Elias Kariuki",
      partyB: "Faith Achieng",
      scope:
        "Weekly cleaning of office premises under a signed written agreement",
      price: "60000",
      timeline: "30 days from signing",
      paymentSchedule: "50% upfront, 50% on completion",
      startDate: "2026-10-12",
    },
  },
  {
    docType: "loan-acknowledgement",
    form: {
      lender: "Grace Njeri",
      borrower: "Henry Ochieng",
      amount: "200000",
      repaymentDate: "2027-01-15",
      purpose:
        "Business expansion loan documented in a signed written agreement",
    },
  },
  {
    docType: "complaint-letter",
    form: {
      sender: "Irene Adhiambo",
      recipient: "Jumbo Electronics Ltd",
      issue:
        "Faulty television supplied last month; the seller refuses a refund",
      remedy: "Replacement or full refund",
      deadline: "14",
      reference: "12 October 2026",
    },
  },
  {
    docType: "refund-letter",
    form: {
      buyer: "Kevin Njoroge",
      seller: "Lake Traders",
      amount: "32000",
      reason: "Defective goods not as described; warranty claim denied",
      purchaseDate: "2026-09-20",
      deadline: "14",
    },
  },
  {
    docType: "tenancy-agreement",
    form: {
      landlord: "Mary Wambui",
      tenant: "Nelson Kiprop",
      property: "Flat 3B, Westlands, Nairobi",
      rent: "55000",
      term: "12 months",
      startDate: "2026-11-01",
    },
  },
  {
    docType: "employment-contract",
    form: {
      employer: "Orbit Logistics Ltd",
      employee: "Peter Kamau",
      jobTitle: "Warehouse Supervisor",
      salary: "75000",
      startDate: "2026-11-01",
      duties: "Supervising dispatch; rostered working hours with annual leave",
    },
  },
  {
    docType: "affidavit",
    form: {
      deponent: "Quinter Aoko",
      statement:
        "I reside in Kisumu and I am swearing this affidavit before a commissioner for oaths",
      place: "Kisumu",
      swornDate: "12 October 2026",
    },
  },
  {
    docType: "salary-claim",
    form: {
      employee: "Ruth Atieno",
      employer: "Delta Hardware Ltd",
      jobTitle: "Sales Assistant",
      amount: "64000",
      dueDate: "2026-09-30",
      issue:
        "Unpaid salary for July to September 2026 and notice pay after termination",
      deadline: "7",
    },
  },
]

let failures = 0

function check(name: string, condition: boolean, detail = ""): void {
  if (condition) {
    console.log(`PASS  ${name}`)
  } else {
    failures += 1
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`)
  }
}

// 1. Every supported type generates + validates clean.
for (const sample of SAMPLES) {
  const grounded = generateGroundedDocument(sample.docType, sample.form, TODAY)
  check(
    `${sample.docType}: retrieval sufficient`,
    grounded.retrieval.sufficient,
    JSON.stringify(grounded.retrieval.legalIssues)
  )
  check(
    `${sample.docType}: citation validation passes`,
    grounded.validation.ok,
    JSON.stringify(grounded.validation.findings.slice(0, 2))
  )
  const referenceLines = grounded.paragraphs.filter((p) => p.startsWith("• "))
  const allResolve = referenceLines
    .filter((line) => line.includes("kenyalaw.org"))
    .every((line) =>
      grounded.retrieval.evidence.some(
        (item) =>
          line.includes(item.provision.id) ||
          (line.includes(item.source.title) &&
            line.includes(item.provision.heading))
      )
    )
  check(
    `${sample.docType}: references resolve to retrieved evidence`,
    allResolve
  )
  const citesConstitution = grounded.paragraphs.some((p) =>
    p.includes("Constitution of Kenya")
  )
  check(
    `${sample.docType}: Constitution not cited by default`,
    !citesConstitution
  )
  for (const item of grounded.retrieval.evidence) {
    check(
      `${sample.docType}: evidence ${item.provision.id} has keyword overlap (semantic-only never cited)`,
      item.matchedKeywords.length > 0
    )
    check(
      `${sample.docType}: evidence ${item.provision.id} exists in repository`,
      getProvisionById(item.provision.id) !== undefined
    )
  }
}

// 2. Fabricated citations are rejected.
{
  const sample = SAMPLES[0]
  const grounded = generateGroundedDocument(sample.docType, sample.form, TODAY)
  const tampered = [
    ...grounded.bodyParagraphs,
    "According to Section 99 of the Employment Act, 2007, the debtor must pay triple damages.",
    'As the court held in Kamau v Otieno [2021] eKLR, "the landlord provides that eviction is automatic".',
  ]
  const validation = validateCitations(tampered, grounded.retrieval)
  check("fabricated Section 99 rejected", !validation.ok)
  check(
    "fabricated findings name the inventions",
    validation.findings.length >= 2,
    JSON.stringify(validation.findings)
  )
  check(
    "invented case law rejected",
    validation.findings.some(
      (f) => f.excerpt.includes("Kamau") || f.excerpt.includes("eKLR")
    )
  )
}

// 3. Insufficient evidence → limitation notice, no invented law.
{
  const grounded = generateGroundedDocument(
    "demand-letter",
    {
      sender: "A",
      recipient: "B",
      issue: "Return of my borrowed lawnmower",
      amount: "",
      dueDate: "",
      action: "Return the item",
      deadline: "7",
    },
    TODAY
  )
  check("insufficient evidence detected", !grounded.retrieval.sufficient)
  check(
    "limitation notice disclosed",
    (grounded.retrieval.limitationNotice ?? "").length > 0 &&
      grounded.paragraphs.join("\n").includes("could not verify")
  )
  check(
    "no authorities cited when evidence insufficient",
    !grounded.paragraphs.some((p) => p.includes("kenyalaw.org"))
  )
  check(
    "insufficient-evidence output still validates",
    grounded.validation.ok,
    JSON.stringify(grounded.validation.findings)
  )
}

// 4. Missing facts flagged, never guessed.
{
  const grounded = generateGroundedDocument(
    "affidavit",
    { deponent: "", statement: "" },
    TODAY
  )
  check("missing fields flagged", grounded.missingInfo.includes("deponent"))
  check(
    "missing-info section rendered",
    grounded.paragraphs.join("\n").includes("# INFORMATION STILL NEEDED")
  )
}

// 5. DOCX export is a valid package.
{
  const grounded = generateGroundedDocument(
    "tenancy-agreement",
    SAMPLES[6].form,
    TODAY
  )
  const bytes = buildDocx(grounded.paragraphs, {
    title: "RESIDENTIAL TENANCY AGREEMENT",
  })
  const text = new TextDecoder("latin1").decode(bytes.slice(0, 4000))
  check(
    "docx has ZIP magic",
    bytes[0] === 0x50 &&
      bytes[1] === 0x4b &&
      bytes[2] === 0x03 &&
      bytes[3] === 0x04
  )
  check("docx contains document.xml", text.includes("word/document.xml"))
  check("docx contains content types", text.includes("[Content_Types].xml"))
  let hasEocd = false
  const scanFrom = Math.max(0, bytes.length - 22 - 65557)
  for (let i = bytes.length - 22; i >= scanFrom; i--) {
    if (
      bytes[i] === 0x50 &&
      bytes[i + 1] === 0x4b &&
      bytes[i + 2] === 0x05 &&
      bytes[i + 3] === 0x06
    ) {
      hasEocd = true
      break
    }
  }
  check("docx has end-of-central-directory", hasEocd)
}

// 6. Maintenance flags stale sources.
{
  const stale = checkSourcesForStaleness(
    LEGAL_SOURCES.map((s) => ({ ...s, lastCheckedAt: "2024-01-01" })),
    new Date("2026-10-12")
  )
  check(
    "old sources flagged stale",
    stale.every((item) => item.stale)
  )
  const fresh = checkSourcesForStaleness(LEGAL_SOURCES, new Date("2026-10-12"))
  check(
    "current repository not stale",
    fresh.every((item) => !item.stale),
    JSON.stringify(fresh.filter((i) => i.stale))
  )
}

// 7. Retrieval is deterministic.
{
  const first = retrieveLegalEvidence("affidavit", SAMPLES[8].form)
  const second = retrieveLegalEvidence("affidavit", SAMPLES[8].form)
  check(
    "retrieval deterministic",
    JSON.stringify(first.evidence.map((e) => e.provision.id)) ===
      JSON.stringify(second.evidence.map((e) => e.provision.id))
  )
}

console.log(
  failures === 0
    ? "\nAll grounding tests passed."
    : `\n${failures} test(s) failed.`
)
process.exit(failures === 0 ? 0 : 1)
