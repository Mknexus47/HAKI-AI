export interface DemandLetterForm {
  sender: string;
  phone: string;
  recipient: string;
  issue: string;
  amount: string;
  dueDate: string;
  action: string;
  deadline: string;
}

export const DEMAND_LETTER_DOC_TYPE = "demand-letter";

export function demandLetterParagraphs(
  form: DemandLetterForm,
  today: string
): string[] {
  return [
    today,
    "",
    `Dear ${form.recipient || "[Recipient Name]"},`,
    "",
    `# RE: DEMAND FOR PAYMENT — ${form.issue.toUpperCase()}`,
    "",
    `I, ${form.sender || "[Your Name]"} (telephone: ${
      form.phone || "[phone]"
    }), formally demand the sum of KES ${
      form.amount || "[Amount]"
    } owed to me in respect of ${form.issue.toLowerCase()}.`,
    form.dueDate
      ? `Payment was due on ${form.dueDate}.`
      : "Payment was due on [date money was due].",
    `The action required of you is: ${form.action}.`,
    `Please comply within ${form.deadline || "7"} days of receiving this letter.`,
    "",
    "If the matter remains unresolved within the stated deadline, I reserve the right to pursue further recovery measures available under Kenyan law, without prejudice to any other rights I may have.",
    "",
    "Yours faithfully,",
    form.sender || "[Your Name]",
    "",
    "DISCLAIMER: This document was generated from a fixed HAKI AI template and provides general legal information only. It does not constitute legal advice and does not create a lawyer-client relationship.",
  ];
}

export const DOCUMENT_TITLES: Record<string, string> = {
  [DEMAND_LETTER_DOC_TYPE]: "Demand Letter",
};
