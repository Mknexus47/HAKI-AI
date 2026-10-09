"use client";

import GeneratorShell from "@/components/documents/GeneratorShell";
import {
  SERVICE_AGREEMENT_DOC_TYPE,
  serviceAgreementParagraphs,
} from "@/lib/documents";

export default function GenerateServiceAgreementPage() {
  return (
    <GeneratorShell
      docType={SERVICE_AGREEMENT_DOC_TYPE}
      title="Business Service Agreement Generator"
      intro="Complete the guided form below. Your document is generated from a fixed template — no raw AI drafting — and downloads as a PDF."
      fields={[
        { key: "partyA", label: "Service provider name" },
        { key: "partyB", label: "Client name" },
        {
          key: "scope",
          label: "Scope of work",
          type: "textarea",
          span: true,
          placeholder: "e.g. Weekly cleaning of office premises...",
        },
        { key: "price", label: "Total price (KES)", type: "text" },
        {
          key: "timeline",
          label: "Timeline",
          placeholder: "e.g. 30 days from signing",
        },
        {
          key: "paymentSchedule",
          label: "Payment schedule",
          span: true,
          placeholder: "e.g. 50% upfront, 50% on completion",
        },
        { key: "startDate", label: "Agreement date", type: "date" },
      ]}
      emptyForm={{
        partyA: "",
        partyB: "",
        scope: "",
        price: "",
        timeline: "",
        paymentSchedule: "",
        startDate: "",
      }}
      buildParagraphs={serviceAgreementParagraphs}
      titleForHistory={(form) =>
        `Service agreement — ${form.partyA || "—"} / ${form.partyB || "—"} — KES ${form.price || "—"}`
      }
    />
  );
}
