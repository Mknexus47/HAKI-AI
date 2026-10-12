"use client"

import GeneratorShell from "@/components/documents/GeneratorShell"
import {
  EMPLOYMENT_CONTRACT_DOC_TYPE,
  employmentContractParagraphs,
} from "@/lib/documents"

export default function GenerateEmploymentContractPage() {
  return (
    <GeneratorShell
      docType={EMPLOYMENT_CONTRACT_DOC_TYPE}
      title="Employment Contract Generator"
      intro="Complete the guided form below. Your document is generated from a fixed template plus legal references retrieved from verified Kenyan sources, and downloads as PDF or DOCX."
      fields={[
        { key: "employer", label: "Employer name" },
        { key: "employee", label: "Employee name" },
        { key: "jobTitle", label: "Job title" },
        { key: "salary", label: "Monthly salary (KES)", type: "text" },
        { key: "startDate", label: "Start date", type: "date" },
        {
          key: "duties",
          label: "Key duties",
          type: "textarea",
          span: true,
          placeholder: "e.g. Daily bookkeeping and monthly payroll...",
        },
      ]}
      emptyForm={{
        employer: "",
        employee: "",
        jobTitle: "",
        salary: "",
        startDate: "",
        duties: "",
      }}
      buildParagraphs={employmentContractParagraphs}
      titleForHistory={(form) =>
        `Employment contract — ${form.employee || "—"} — ${form.jobTitle || "—"}`
      }
    />
  )
}
