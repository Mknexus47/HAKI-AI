"use client";

import GeneratorShell from "@/components/documents/GeneratorShell";
import { REFUND_LETTER_DOC_TYPE, refundLetterParagraphs } from "@/lib/documents";

export default function GenerateRefundLetterPage() {
  return (
    <GeneratorShell
      docType={REFUND_LETTER_DOC_TYPE}
      title="Request for Refund Letter Generator"
      intro="Complete the guided form below. Your document is generated from a fixed template — no raw AI drafting — and downloads as a PDF."
      fields={[
        { key: "buyer", label: "Buyer full name" },
        { key: "seller", label: "Seller full name" },
        { key: "amount", label: "Amount paid (KES)", type: "text" },
        { key: "purchaseDate", label: "Purchase date", type: "date" },
        {
          key: "reason",
          label: "Reason for refund",
          type: "textarea",
          span: true,
          placeholder: "e.g. Goods not delivered...",
        },
        { key: "deadline", label: "Deadline (days)", type: "number" },
      ]}
      emptyForm={{
        buyer: "",
        seller: "",
        amount: "",
        purchaseDate: "",
        reason: "",
        deadline: "14",
      }}
      buildParagraphs={refundLetterParagraphs}
      titleForHistory={(form) =>
        `Refund request — ${form.seller || "—"} — KES ${form.amount || "—"}`
      }
    />
  );
}
