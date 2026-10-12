export interface DemandLetterForm {
  sender: string
  phone: string
  recipient: string
  issue: string
  amount: string
  dueDate: string
  action: string
  deadline: string
}

export const DEMAND_LETTER_DOC_TYPE = "demand-letter"
export const RENT_ACK_DOC_TYPE = "rent-acknowledgement"
export const SERVICE_AGREEMENT_DOC_TYPE = "service-agreement"
export const LOAN_ACK_DOC_TYPE = "loan-acknowledgement"
export const COMPLAINT_LETTER_DOC_TYPE = "complaint-letter"
export const REFUND_LETTER_DOC_TYPE = "refund-letter"
export const TENANCY_AGREEMENT_DOC_TYPE = "tenancy-agreement"
export const EMPLOYMENT_CONTRACT_DOC_TYPE = "employment-contract"
export const AFFIDAVIT_DOC_TYPE = "affidavit"

export type GenericForm = Record<string, string>

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
  ]
}

export const DOCUMENT_TITLES: Record<string, string> = {
  [DEMAND_LETTER_DOC_TYPE]: "Demand Letter",
  [RENT_ACK_DOC_TYPE]: "Rent Acknowledgement Letter",
  [SERVICE_AGREEMENT_DOC_TYPE]: "Business Service Agreement",
  [LOAN_ACK_DOC_TYPE]: "Loan Acknowledgement Letter",
  [COMPLAINT_LETTER_DOC_TYPE]: "Complaint Letter",
  [REFUND_LETTER_DOC_TYPE]: "Request for Refund Letter",
  [TENANCY_AGREEMENT_DOC_TYPE]: "Residential Tenancy Agreement",
  [EMPLOYMENT_CONTRACT_DOC_TYPE]: "Employment Contract",
  [AFFIDAVIT_DOC_TYPE]: "Affidavit",
}

export const DOCUMENT_PDF_TITLES: Record<string, string> = {
  [DEMAND_LETTER_DOC_TYPE]: "DEMAND LETTER",
  [RENT_ACK_DOC_TYPE]: "RENT ACKNOWLEDGEMENT LETTER",
  [SERVICE_AGREEMENT_DOC_TYPE]: "SERVICE AGREEMENT",
  [LOAN_ACK_DOC_TYPE]: "LOAN ACKNOWLEDGEMENT LETTER",
  [COMPLAINT_LETTER_DOC_TYPE]: "COMPLAINT LETTER",
  [REFUND_LETTER_DOC_TYPE]: "REQUEST FOR REFUND",
  [TENANCY_AGREEMENT_DOC_TYPE]: "RESIDENTIAL TENANCY AGREEMENT",
  [EMPLOYMENT_CONTRACT_DOC_TYPE]: "CONTRACT OF SERVICE",
  [AFFIDAVIT_DOC_TYPE]: "AFFIDAVIT",
}

export const DOCUMENT_EDIT_PATHS: Record<string, string> = {
  [DEMAND_LETTER_DOC_TYPE]: "/generate-demand-letter",
  [RENT_ACK_DOC_TYPE]: "/generate-rent-acknowledgement",
  [SERVICE_AGREEMENT_DOC_TYPE]: "/generate-service-agreement",
  [LOAN_ACK_DOC_TYPE]: "/generate-loan-acknowledgement",
  [COMPLAINT_LETTER_DOC_TYPE]: "/generate-complaint-letter",
  [REFUND_LETTER_DOC_TYPE]: "/generate-refund-letter",
  [TENANCY_AGREEMENT_DOC_TYPE]: "/generate-tenancy-agreement",
  [EMPLOYMENT_CONTRACT_DOC_TYPE]: "/generate-employment-contract",
  [AFFIDAVIT_DOC_TYPE]: "/generate-affidavit",
}

/** Fields the user should complete; blanks are flagged, never guessed. */
export const DOCUMENT_REQUIRED_FIELDS: Record<string, string[]> = {
  [DEMAND_LETTER_DOC_TYPE]: [
    "sender",
    "recipient",
    "amount",
    "issue",
    "deadline",
  ],
  [RENT_ACK_DOC_TYPE]: ["landlord", "tenant", "property", "amount", "period"],
  [SERVICE_AGREEMENT_DOC_TYPE]: [
    "partyA",
    "partyB",
    "scope",
    "price",
    "timeline",
  ],
  [LOAN_ACK_DOC_TYPE]: ["lender", "borrower", "amount", "repaymentDate"],
  [COMPLAINT_LETTER_DOC_TYPE]: ["sender", "recipient", "issue", "remedy"],
  [REFUND_LETTER_DOC_TYPE]: [
    "buyer",
    "seller",
    "amount",
    "reason",
    "purchaseDate",
  ],
  [TENANCY_AGREEMENT_DOC_TYPE]: [
    "landlord",
    "tenant",
    "property",
    "rent",
    "term",
    "startDate",
  ],
  [EMPLOYMENT_CONTRACT_DOC_TYPE]: [
    "employer",
    "employee",
    "jobTitle",
    "salary",
    "startDate",
  ],
  [AFFIDAVIT_DOC_TYPE]: ["deponent", "statement"],
}

export interface RentAckForm {
  landlord: string
  tenant: string
  property: string
  amount: string
  period: string
  receiptDate: string
}

export function rentAckParagraphs(form: GenericForm, today: string): string[] {
  const landlord = form.landlord || "[Landlord Name]"
  const tenant = form.tenant || "[Tenant Name]"
  const property = form.property || "[Property address/house number]"
  const amount = form.amount || "[Amount]"
  const period = form.period || "[Rent period, e.g. September 2026]"
  const receiptDate = form.receiptDate || today
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
  ]
}

export interface ServiceAgreementForm {
  partyA: string
  partyB: string
  scope: string
  price: string
  timeline: string
  paymentSchedule: string
  startDate: string
}

export function serviceAgreementParagraphs(
  form: GenericForm,
  today: string
): string[] {
  const partyA = form.partyA || "[Party A Name]"
  const partyB = form.partyB || "[Party B Name]"
  const scope = form.scope || "[Description of services]"
  const price = form.price || "[Total price]"
  const timeline = form.timeline || "[Timeline, e.g. 30 days from signing]"
  const paymentSchedule =
    form.paymentSchedule ||
    "[Payment schedule, e.g. 50% upfront, 50% on completion]"
  const startDate = form.startDate || today
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
  ]
}

export interface LoanAckForm {
  lender: string
  borrower: string
  amount: string
  repaymentDate: string
  purpose: string
}

export function loanAckParagraphs(form: GenericForm, today: string): string[] {
  const lender = form.lender || "[Lender Name]"
  const borrower = form.borrower || "[Borrower Name]"
  const amount = form.amount || "[Amount]"
  const repaymentDate = form.repaymentDate || "[Repayment date]"
  const purpose = form.purpose || "[Purpose of the loan]"
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
  ]
}

export interface ComplaintLetterForm {
  sender: string
  recipient: string
  issue: string
  remedy: string
  deadline: string
  reference: string
}

export function complaintLetterParagraphs(
  form: GenericForm,
  today: string
): string[] {
  const sender = form.sender || "[Your Name]"
  const recipient = form.recipient || "[Recipient Name]"
  const issue = form.issue || "[Description of the issue]"
  const remedy = form.remedy || "[Remedy requested]"
  const deadline = form.deadline || "14"
  const reference = form.reference || today
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
  ]
}

export interface RefundLetterForm {
  buyer: string
  seller: string
  amount: string
  reason: string
  purchaseDate: string
  deadline: string
}

export function refundLetterParagraphs(
  form: GenericForm,
  today: string
): string[] {
  const buyer = form.buyer || "[Buyer Name]"
  const seller = form.seller || "[Seller Name]"
  const amount = form.amount || "[Amount]"
  const reason = form.reason || "[Reason, e.g. goods not delivered]"
  const purchaseDate = form.purchaseDate || "[Purchase date]"
  const deadline = form.deadline || "14"
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
  ]
}

export function tenancyAgreementParagraphs(
  form: GenericForm,
  today: string
): string[] {
  const landlord = form.landlord || "[Landlord Name]"
  const tenant = form.tenant || "[Tenant Name]"
  const property = form.property || "[Property address/house number]"
  const rent = form.rent || "[Monthly rent]"
  const term = form.term || "[Term, e.g. 12 months]"
  const startDate = form.startDate || today
  return [
    today,
    "",
    "# RESIDENTIAL TENANCY AGREEMENT",
    "",
    `This tenancy agreement is made on ${startDate} between ${landlord} ("Landlord") and ${tenant} ("Tenant") for the residential premises at ${property}.`,
    "",
    "# 1. Term",
    "",
    `The tenancy shall run for ${term} starting on ${startDate}.`,
    "",
    "# 2. Rent",
    "",
    `The Tenant shall pay rent of KES ${rent} per month. The parties should record each payment and keep receipts.`,
    "",
    "# 3. Use of the premises",
    "",
    "The Tenant shall occupy the premises as a residence, keep them in reasonable condition, and promptly report damage or needed repairs to the Landlord in writing.",
    "",
    "# 4. Ending the tenancy",
    "",
    "Either party wishing to end the tenancy should give written notice in good time and follow the applicable tenancy law procedure. See the Legal References section of this document.",
    "",
    "# 5. Signatures",
    "",
    `Signed: ____________________  ${landlord} (Landlord)`,
    "",
    `Signed: ____________________  ${tenant} (Tenant)`,
    "",
    "NOTE: This is a basic template only. For deposits, repairs, rent increases, or eviction steps, have a licensed advocate review before signing.",
    "",
    "DISCLAIMER: This document was generated from a fixed HAKI AI template and provides general legal information only. It does not constitute legal advice and does not create a lawyer-client relationship.",
  ]
}

export function employmentContractParagraphs(
  form: GenericForm,
  today: string
): string[] {
  const employer = form.employer || "[Employer Name]"
  const employee = form.employee || "[Employee Name]"
  const jobTitle = form.jobTitle || "[Job title]"
  const salary = form.salary || "[Monthly salary]"
  const startDate = form.startDate || today
  const duties = form.duties || "[Key duties]"
  return [
    today,
    "",
    "# CONTRACT OF SERVICE",
    "",
    `This contract of service is made on ${startDate} between ${employer} ("Employer") and ${employee} ("Employee"), employed as ${jobTitle}.`,
    "",
    "# 1. Duties",
    "",
    duties,
    "",
    "# 2. Salary",
    "",
    `The Employee shall be paid a salary of KES ${salary} per month, with an itemised pay statement.`,
    "",
    "# 3. Working hours and leave",
    "",
    "Working hours, rest days, and leave shall follow the terms agreed by the parties and the applicable employment law. See the Legal References section of this document.",
    "",
    "# 4. Ending employment",
    "",
    "Ending this contract requires a valid reason and fair procedure with written notice. See the Legal References section of this document.",
    "",
    "# 5. Signatures",
    "",
    `Signed: ____________________  ${employer} (Employer)`,
    "",
    `Signed: ____________________  ${employee} (Employee)`,
    "",
    "NOTE: This is a basic template only. For probation, benefits, confidentiality, or termination terms, have a licensed advocate review before signing.",
    "",
    "DISCLAIMER: This document was generated from a fixed HAKI AI template and provides general legal information only. It does not constitute legal advice and does not create a lawyer-client relationship.",
  ]
}

export function affidavitParagraphs(
  form: GenericForm,
  today: string
): string[] {
  const deponent = form.deponent || "[Full Name of Deponent]"
  const statement =
    form.statement ||
    "[State the facts clearly, numbered paragraph by paragraph]"
  const place = form.place || "____________________"
  const swornDate =
    form.swornDate || "______ day of ____________________ 20______"
  return [
    today,
    "",
    "# AFFIDAVIT",
    "",
    `I, ${deponent}, do solemnly swear and state as follows:`,
    "",
    `1. That I am the deponent herein and competent to swear this affidavit.`,
    "",
    `2. That ${statement}`,
    "",
    "3. That what is stated above is true to the best of my knowledge, information, and belief.",
    "",
    `SWORN at ${place} on this ${swornDate}`,
    "",
    "BEFORE ME:",
    "",
    "______________________________",
    "Commissioner for Oaths",
    "",
    "______________________________",
    "Deponent",
    "",
    "NOTE: An affidavit has no legal effect until it is sworn before a commissioner for oaths (or other authorised officer) who completes the jurat with the place and date. A false declaration is an offence. See the Legal References section and have a licensed advocate review before use.",
    "",
    "DISCLAIMER: This document was generated from a fixed HAKI AI template and provides general legal information only. It does not constitute legal advice and does not create a lawyer-client relationship.",
  ]
}

export function buildParagraphsForDoc(
  docType: string,
  form: GenericForm,
  today: string
): string[] {
  switch (docType) {
    case RENT_ACK_DOC_TYPE:
      return rentAckParagraphs(form, today)
    case SERVICE_AGREEMENT_DOC_TYPE:
      return serviceAgreementParagraphs(form, today)
    case LOAN_ACK_DOC_TYPE:
      return loanAckParagraphs(form, today)
    case COMPLAINT_LETTER_DOC_TYPE:
      return complaintLetterParagraphs(form, today)
    case REFUND_LETTER_DOC_TYPE:
      return refundLetterParagraphs(form, today)
    case TENANCY_AGREEMENT_DOC_TYPE:
      return tenancyAgreementParagraphs(form, today)
    case EMPLOYMENT_CONTRACT_DOC_TYPE:
      return employmentContractParagraphs(form, today)
    case AFFIDAVIT_DOC_TYPE:
      return affidavitParagraphs(form, today)
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
      )
  }
}
