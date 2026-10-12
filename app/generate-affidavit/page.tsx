"use client"

import GeneratorShell from "@/components/documents/GeneratorShell"
import { AFFIDAVIT_DOC_TYPE, affidavitParagraphs } from "@/lib/documents"

export default function GenerateAffidavitPage() {
  return (
    <GeneratorShell
      docType={AFFIDAVIT_DOC_TYPE}
      title="Affidavit Generator"
      intro="Complete the guided form below. Your affidavit draft is generated from a fixed template plus legal references retrieved from verified Kenyan sources, and downloads as PDF or DOCX. It must still be sworn before a commissioner for oaths."
      fields={[
        { key: "deponent", label: "Full name of deponent" },
        {
          key: "place",
          label: "Place of swearing",
          placeholder: "e.g. Nairobi",
        },
        { key: "swornDate", label: "Date of swearing", type: "date" },
        {
          key: "statement",
          label: "Statement of facts",
          type: "textarea",
          span: true,
          placeholder:
            "State the facts clearly, e.g. I reside at... On 3 March 2026...",
        },
      ]}
      emptyForm={{
        deponent: "",
        place: "",
        swornDate: "",
        statement: "",
      }}
      buildParagraphs={affidavitParagraphs}
      titleForHistory={(form) => `Affidavit — ${form.deponent || "—"}`}
    />
  )
}
