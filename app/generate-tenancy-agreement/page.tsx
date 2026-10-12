"use client"

import GeneratorShell from "@/components/documents/GeneratorShell"
import {
  TENANCY_AGREEMENT_DOC_TYPE,
  tenancyAgreementParagraphs,
} from "@/lib/documents"

export default function GenerateTenancyAgreementPage() {
  return (
    <GeneratorShell
      docType={TENANCY_AGREEMENT_DOC_TYPE}
      title="Residential Tenancy Agreement Generator"
      intro="Complete the guided form below. Your document is generated from a fixed template plus legal references retrieved from verified Kenyan sources, and downloads as PDF or DOCX."
      fields={[
        { key: "landlord", label: "Landlord name" },
        { key: "tenant", label: "Tenant name" },
        {
          key: "property",
          label: "Property address",
          span: true,
          placeholder: "e.g. House B4, Riverside Estate, Nairobi",
        },
        { key: "rent", label: "Monthly rent (KES)", type: "text" },
        {
          key: "term",
          label: "Term",
          placeholder: "e.g. 12 months",
        },
        { key: "startDate", label: "Start date", type: "date" },
      ]}
      emptyForm={{
        landlord: "",
        tenant: "",
        property: "",
        rent: "",
        term: "",
        startDate: "",
      }}
      buildParagraphs={tenancyAgreementParagraphs}
      titleForHistory={(form) =>
        `Tenancy agreement — ${form.property || "—"} — KES ${form.rent || "—"}/mo`
      }
    />
  )
}
