import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"
import PageShell from "@/components/layout/PageShell"

interface Template {
  name: string
  description: string
  fields: string
  href?: string
}

const templates: Template[] = [
  {
    name: "Simple Demand Letter",
    description: "Formally demand money owed with a clear amount and deadline.",
    fields: "Sender, recipient, amount, reason, deadline",
    href: "/generate-demand-letter",
  },
  {
    name: "Rent Acknowledgement Letter",
    description: "Acknowledge rent received and record the payment terms.",
    fields: "Landlord, tenant, property, amount, period",
    href: "/generate-rent-acknowledgement",
  },
  {
    name: "Business Service Agreement Draft",
    description: "A simple agreement covering scope, price, and timelines.",
    fields: "Parties, scope, price, timeline, payment schedule",
    href: "/generate-service-agreement",
  },
  {
    name: "Loan Acknowledgement Letter",
    description: "Record a loan amount, repayment terms, and both parties.",
    fields: "Lender, borrower, amount, repayment date",
    href: "/generate-loan-acknowledgement",
  },
  {
    name: "Complaint Letter",
    description:
      "A formal complaint to a business, office, or service provider.",
    fields: "Sender, recipient, issue, remedy requested, deadline",
    href: "/generate-complaint-letter",
  },
  {
    name: "Request for Refund Letter",
    description:
      "Request a refund for goods or services that were not delivered.",
    fields: "Buyer, seller, amount, reason, purchase date",
    href: "/generate-refund-letter",
  },
  {
    name: "Residential Tenancy Agreement",
    description:
      "A basic tenancy agreement recording parties, property, rent, and term.",
    fields: "Landlord, tenant, property, rent, term, start date",
    href: "/generate-tenancy-agreement",
  },
  {
    name: "Employment Contract",
    description:
      "A basic contract of service covering duties, salary, and key terms.",
    fields: "Employer, employee, job title, salary, start date",
    href: "/generate-employment-contract",
  },
  {
    name: "Affidavit",
    description:
      "A sworn-statement draft with jurat — must be commissioned before use.",
    fields: "Deponent, statement of facts, place, date",
    href: "/generate-affidavit",
  },
  {
    name: "Salary / Final Pay Claim",
    description:
      "Formally claim unpaid salary or final pay from a former employer.",
    fields: "Employee, employer, amount, what is owed, deadline",
    href: "/generate-salary-claim",
  },
]

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Document Generator",
  "Generate basic legal documents for Kenya in minutes: demand letters, agreements, affidavits, and more.",
  "/document-generator"
);

export default function DocumentGeneratorPage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        Document Generator
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        Choose a template, fill in a guided form, and download your document.
        All documents are generated from fixed templates plus legal references
        retrieved from a{" "}
        <Link
          href="/legal-sources"
          className="font-semibold text-[#c0221b] underline underline-offset-2"
        >
          verified repository of Kenyan legal sources
        </Link>{" "}
        — no raw AI drafting, and every citation is validated before export.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const card = (
            <>
              <span
                className="icon-gradient mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm"
                aria-hidden="true"
              >
                <FileText className="h-6 w-6" />
              </span>
              <span className="text-lg font-semibold text-slate-900">
                {template.name}
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-slate-600">
                {template.description}
              </span>
              <span className="mt-3 block text-xs text-slate-500">
                Fields: {template.fields}
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                Open generator
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </>
          )

          return template.href ? (
            <Link
              key={template.name}
              href={template.href}
              className="card-gradient group flex flex-col rounded-xl border p-6 shadow-sm"
            >
              {card}
            </Link>
          ) : (
            <div
              key={template.name}
              className="card-gradient flex flex-col rounded-xl border p-6 opacity-80 shadow-sm"
            >
              {card}
            </div>
          )
        })}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href="/generate-demand-letter"
          className="btn-gradient-primary inline-flex h-[52px] items-center rounded-full px-8 text-[15px] font-semibold"
        >
          Try the Demand Letter Generator
        </Link>
        <Link
          href="/contract-analysis"
          className="inline-flex h-[52px] items-center rounded-full border border-slate-300 px-8 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-white hover:text-slate-900"
        >
          Scan an existing contract (OCR)
        </Link>
      </div>
    </PageShell>
  )
}
