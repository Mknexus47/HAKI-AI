"use client";

import GeneratorShell from "@/components/documents/GeneratorShell";
import { LOAN_ACK_DOC_TYPE, loanAckParagraphs } from "@/lib/documents";

export default function GenerateLoanAcknowledgementPage() {
  return (
    <GeneratorShell
      docType={LOAN_ACK_DOC_TYPE}
      title="Loan Acknowledgement Letter Generator"
      intro="Complete the guided form below. Your document is generated from a fixed template — no raw AI drafting — and downloads as a PDF."
      fields={[
        { key: "lender", label: "Lender full name" },
        { key: "borrower", label: "Borrower full name" },
        { key: "amount", label: "Loan amount (KES)", type: "text" },
        { key: "repaymentDate", label: "Repayment date", type: "date" },
        {
          key: "purpose",
          label: "Purpose of the loan",
          span: true,
          placeholder: "e.g. School fees advance",
        },
      ]}
      emptyForm={{
        lender: "",
        borrower: "",
        amount: "",
        repaymentDate: "",
        purpose: "",
      }}
      buildParagraphs={loanAckParagraphs}
      titleForHistory={(form) =>
        `Loan acknowledgement — ${form.borrower || "—"} — KES ${form.amount || "—"}`
      }
    />
  );
}
