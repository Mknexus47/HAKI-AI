"use client";

import GeneratorShell from "@/components/documents/GeneratorShell";
import { RENT_ACK_DOC_TYPE, rentAckParagraphs } from "@/lib/documents";

export default function GenerateRentAcknowledgementPage() {
  return (
    <GeneratorShell
      docType={RENT_ACK_DOC_TYPE}
      title="Rent Acknowledgement Letter Generator"
      intro="Complete the guided form below. Your document is generated from a fixed template — no raw AI drafting — and downloads as a PDF."
      fields={[
        { key: "landlord", label: "Landlord full name" },
        { key: "tenant", label: "Tenant full name" },
        {
          key: "property",
          label: "Property (address / house number)",
          span: true,
        },
        { key: "amount", label: "Amount received (KES)", type: "text" },
        {
          key: "period",
          label: "Rent period",
          placeholder: "e.g. September 2026",
        },
        { key: "receiptDate", label: "Date received", type: "date" },
      ]}
      emptyForm={{
        landlord: "",
        tenant: "",
        property: "",
        amount: "",
        period: "",
        receiptDate: "",
      }}
      buildParagraphs={rentAckParagraphs}
      titleForHistory={(form) =>
        `Rent acknowledgement — ${form.tenant || "—"} — KES ${form.amount || "—"}`
      }
    />
  );
}
