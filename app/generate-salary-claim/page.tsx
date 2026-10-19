"use client";

import GeneratorShell from "@/components/documents/GeneratorShell";
import {
  SALARY_CLAIM_DOC_TYPE,
  salaryClaimParagraphs,
} from "@/lib/documents";

export default function GenerateSalaryClaimPage() {
  return (
    <GeneratorShell
      docType={SALARY_CLAIM_DOC_TYPE}
      title="Salary / Final Pay Claim Generator"
      intro="Complete the guided form below to claim unpaid salary or final pay from a former employer. Your document is generated from a fixed template with retrieved legal references — no raw AI drafting — and downloads as a PDF or DOCX."
      fields={[
        { key: "employee", label: "Employee full name" },
        { key: "employer", label: "Employer name" },
        { key: "jobTitle", label: "Job title" },
        { key: "amount", label: "Amount claimed (KES)", type: "text" },
        { key: "dueDate", label: "Date payment was due", type: "date" },
        {
          key: "issue",
          label: "What the claim covers",
          type: "textarea",
          span: true,
          placeholder:
            "e.g. Unpaid salary for March–May 2026 and 30 days notice pay",
        },
        { key: "deadline", label: "Deadline for payment (days)", type: "number" },
      ]}
      emptyForm={{
        employee: "",
        employer: "",
        jobTitle: "",
        amount: "",
        dueDate: "",
        issue: "",
        deadline: "7",
      }}
      buildParagraphs={salaryClaimParagraphs}
      titleForHistory={(form) =>
        `Salary claim — ${form.employer || "—"} — KES ${form.amount || "—"}`
      }
    />
  );
}
