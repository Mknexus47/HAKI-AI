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
export const RENT_ACK_DOC_TYPE = "rent-acknowledgement";
export const SERVICE_AGREEMENT_DOC_TYPE = "service-agreement";
export const LOAN_ACK_DOC_TYPE = "loan-acknowledgement";
export const COMPLAINT_LETTER_DOC_TYPE = "complaint-letter";
export const REFUND_LETTER_DOC_TYPE = "refund-letter";

export type GenericForm = Record<string, string>;

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
      : "Payment was due on 1 September 2026 (sample date - enter the actual due date).",
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
  [RENT_ACK_DOC_TYPE]: "Rent Acknowledgement Letter",
  [SERVICE_AGREEMENT_DOC_TYPE]: "Business Service Agreement",
  [LOAN_ACK_DOC_TYPE]: "Loan Acknowledgement Letter",
  [COMPLAINT_LETTER_DOC_TYPE]: "Complaint Letter",
  [REFUND_LETTER_DOC_TYPE]: "Request for Refund Letter",
};

export const DOCUMENT_PDF_TITLES: Record<string, string> = {
  [DEMAND_LETTER_DOC_TYPE]: "DEMAND LETTER",
  [RENT_ACK_DOC_TYPE]: "RENT ACKNOWLEDGEMENT LETTER",
  [SERVICE_AGREEMENT_DOC_TYPE]: "SERVICE AGREEMENT",
  [LOAN_ACK_DOC_TYPE]: "LOAN ACKNOWLEDGEMENT LETTER",
  [COMPLAINT_LETTER_DOC_TYPE]: "COMPLAINT LETTER",
  [REFUND_LETTER_DOC_TYPE]: "REQUEST FOR REFUND",
};

export const DOCUMENT_EDIT_PATHS: Record<string, string> = {
  [DEMAND_LETTER_DOC_TYPE]: "/generate-demand-letter",
  [RENT_ACK_DOC_TYPE]: "/generate-rent-acknowledgement",
  [SERVICE_AGREEMENT_DOC_TYPE]: "/generate-service-agreement",
  [LOAN_ACK_DOC_TYPE]: "/generate-loan-acknowledgement",
  [COMPLAINT_LETTER_DOC_TYPE]: "/generate-complaint-letter",
  [REFUND_LETTER_DOC_TYPE]: "/generate-refund-letter",
};

export interface RentAckForm {
  landlord: string;
  tenant: string;
  property: string;
  amount: string;
  period: string;
  receiptDate: string;
}

export function rentAckParagraphs(form: GenericForm, today: string): string[] {
  const landlord = form.landlord || "[Landlord Name]";
  const tenant = form.tenant || "[Tenant Name]";
  const property = form.property || "[Property address/house number]";
  const amount = form.amount || "[Amount]";
  const period = form.period || "[Rent period, e.g. September 2026]";
  const receiptDate = form.receiptDate || today;
  return [
    today,
    "",
    "# RE: ACKNOWLEDGEMENT OF RENT PAYMENT",
    "",
    `Dear ${tenant},`,
    "",
    `I, ${landlord}, confirm receipt of KES ${amount} from ${tenant} being rent for the property at ${property} for the period of ${period}.`,
    `Payment was received on ${receiptDate}.`,
    "This acknowledgement is issued for record purposes. Please retain it together with your payment receipt or mobile money confirmation message.",
    "",
    "Yours faithfully,",
    landlord,
    "",
    "DISCLAIMER: This document was generated from a fixed HAKI AI template and provides general legal information only. It does not constitute legal advice and does not create a lawyer-client relationship.",
  ];
}

export interface ServiceAgreementForm {
  partyA: string;
  partyB: string;
  scope: string;
  price: string;
  timeline: string;
  paymentSchedule: string;
  startDate: string;
}

export function serviceAgreementParagraphs(
  form: GenericForm,
  today: string
): string[] {
  const partyA = form.partyA || "[Party A Name]";
  const partyB = form.partyB || "[Party B Name]";
  const scope = form.scope || "[Description of services]";
  const price = form.price || "[Total price]";
  const timeline = form.timeline || "[Timeline, e.g. 30 days from signing]";
  const paymentSchedule =
    form.paymentSchedule || "[Payment schedule, e.g. 50% upfront, 50% on completion]";
  const startDate = form.startDate || today;
  return [
    today,
    "",
    "# SIMPLE SERVICE AGREEMENT",
    "",
    `This simple service agreement is made on ${startDate} between ${partyA} ("Service Provider") and ${partyB} ("Client").`,
    "",
    `# 1. Scope of work`,
    "",
    scope,
    "",
    `# 2. Price`,
    "",
    `The total price for the work is KES ${price}.`,
    "",
    `# 3. Timeline`,
    "",
    `The work shall be completed within ${timeline}.`,
    "",
    `# 4. Payment schedule`,
    "",
    paymentSchedule,
    "",
    `# 5. Signatures`,
    "",
    `Signed: ____________________  ${partyA} (Service Provider)`,
    "",
    `Signed: ____________________  ${partyB} (Client)`,
    "",
    "NOTE: Both parties should read, sign, and each keep a copy. For high-value or complex work, have a licensed advocate review before signing.",
    "",
    "DISCLAIMER: This document was generated from a fixed HAKI AI template and provides general legal information only. It does not constitute legal advice and does not create a lawyer-client relationship.",
  ];
}

export interface LoanAckForm {
  lender: string;
  borrower: string;
  amount: string;
  repaymentDate: string;
  purpose: string;
}

export function loanAckParagraphs(form: GenericForm, today: string): string[] {
  const lender = form.lender || "[Lender Name]";
  const borrower = form.borrower || "[Borrower Name]";
  const amount = form.amount || "[Amount]";
  const repaymentDate = form.repaymentDate || "[Repayment date]";
  const purpose = form.purpose || "[Purpose of the loan]";
  return [
    today,
    "",
    "# LOAN ACKNOWLEDGEMENT LETTER",
    "",
    `Dear ${borrower},`,
    "",
    `I, ${lender}, confirm that I have advanced a loan of KES ${amount} to ${borrower} for the purpose of ${purpose}.`,
    `The borrower undertakes to repay the full amount on or before ${repaymentDate}.`,
    "Both parties should keep a signed copy of this letter together with proof of disbursement and repayment.",
    "",
    "Lender:",
    lender,
    "",
    "Borrower:",
    borrower,
    "",
    "DISCLAIMER: This document was generated from a fixed HAKI AI template and provides general legal information only. It does not constitute legal advice and does not create a lawyer-client relationship.",
  ];
}

export interface ComplaintLetterForm {
  sender: string;
  recipient: string;
  issue: string;
  remedy: string;
  deadline: string;
  reference: string;
}

export function complaintLetterParagraphs(
  form: GenericForm,
  today: string
): string[] {
  const sender = form.sender || "[Your Name]";
  const recipient = form.recipient || "[Recipient Name]";
  const issue = form.issue || "[Description of the issue]";
  const remedy = form.remedy || "[Remedy requested]";
  const deadline = form.deadline || "14";
  const reference = form.reference || today;
  return [
    today,
    "",
    "# RE: FORMAL COMPLAINT",
    "",
    `Dear ${recipient},`,
    "",
    `I, ${sender}, wish to formally raise the following complaint (reference date: ${reference}): ${issue}.`,
    `I request the following remedy: ${remedy}.`,
    `Please resolve this matter within ${deadline} days of receiving this letter.`,
    "If the matter remains unresolved, I reserve the right to escalate to the relevant regulator or seek independent advice.",
    "",
    "Yours faithfully,",
    sender,
    "",
    "DISCLAIMER: This document was generated from a fixed HAKI AI template and provides general legal information only. It does not constitute legal advice and does not create a lawyer-client relationship.",
  ];
}

export interface RefundLetterForm {
  buyer: string;
  seller: string;
  amount: string;
  reason: string;
  purchaseDate: string;
  deadline: string;
}

export function refundLetterParagraphs(
  form: GenericForm,
  today: string
): string[] {
  const buyer = form.buyer || "[Buyer Name]";
  const seller = form.seller || "[Seller Name]";
  const amount = form.amount || "[Amount]";
  const reason = form.reason || "[Reason, e.g. goods not delivered]";
  const purchaseDate = form.purchaseDate || "[Purchase date]";
  const deadline = form.deadline || "14";
  return [
    today,
    "",
    "# RE: REQUEST FOR REFUND",
    "",
    `Dear ${seller},`,
    "",
    `I, ${buyer}, purchased goods/services from you on ${purchaseDate} for KES ${amount}. I hereby request a refund for the following reason: ${reason}.`,
    `Please process the refund within ${deadline} days of receiving this letter.`,
    "I have attached copies of the receipt and related correspondence for your reference.",
    "",
    "Yours faithfully,",
    buyer,
    "",
    "DISCLAIMER: This document was generated from a fixed HAKI AI template and provides general legal information only. It does not constitute legal advice and does not create a lawyer-client relationship.",
  ];
}

export function buildParagraphsForDoc(
  docType: string,
  form: GenericForm,
  today: string
): string[] {
  switch (docType) {
    case RENT_ACK_DOC_TYPE:
      return rentAckParagraphs(form, today);
    case SERVICE_AGREEMENT_DOC_TYPE:
      return serviceAgreementParagraphs(form, today);
    case LOAN_ACK_DOC_TYPE:
      return loanAckParagraphs(form, today);
    case COMPLAINT_LETTER_DOC_TYPE:
      return complaintLetterParagraphs(form, today);
    case REFUND_LETTER_DOC_TYPE:
      return refundLetterParagraphs(form, today);
    case DEMAND_LETTER_DOC_TYPE:
    default:
      return demandLetterParagraphs(
        {
          sender: form.sender ?? "",
          phone: form.phone ?? "",
          recipient: form.recipient ?? "",
          issue: form.issue ?? "Unpaid services rendered",
          amount: form.amount ?? "",
          dueDate: form.dueDate ?? "",
          action: form.action ?? "Full payment of the amount owed",
          deadline: form.deadline ?? "7",
        },
        today
      );
  }
}
