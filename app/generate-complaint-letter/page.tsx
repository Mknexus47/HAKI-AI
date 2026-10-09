"use client";

import GeneratorShell from "@/components/documents/GeneratorShell";
import {
  COMPLAINT_LETTER_DOC_TYPE,
  complaintLetterParagraphs,
} from "@/lib/documents";

export default function GenerateComplaintLetterPage() {
  return (
    <GeneratorShell
      docType={COMPLAINT_LETTER_DOC_TYPE}
      title="Complaint Letter Generator"
      intro="Complete the guided form below. Your document is generated from a fixed template — no raw AI drafting — and downloads as a PDF."
      fields={[
        { key: "sender", label: "Your full name" },
        { key: "recipient", label: "Recipient (business / office)" },
        {
          key: "issue",
          label: "Issue",
          type: "textarea",
          span: true,
          placeholder: "e.g. Faulty phone sold on 10 August 2026...",
        },
        {
          key: "remedy",
          label: "Remedy requested",
          span: true,
          placeholder: "e.g. Replacement or full refund",
        },
        { key: "deadline", label: "Deadline (days)", type: "number" },
        { key: "reference", label: "Reference date", type: "date" },
      ]}
      emptyForm={{
        sender: "",
        recipient: "",
        issue: "",
        remedy: "",
        deadline: "14",
        reference: "",
      }}
      buildParagraphs={complaintLetterParagraphs}
      titleForHistory={(form) =>
        `Complaint letter — ${form.recipient || "—"}`
      }
    />
  );
}
