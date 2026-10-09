// Scoped chat answer engine for HAKI AI.
//
// There is no remote AI backend in this project (no API route, no model
// dependency, no provider key), so answers are produced locally from fixed,
// reviewed templates. Every answer is computed fresh from the exact latest
// user question passed to getAnswer() — no conversation state, no cached or
// reused previous answers.
//
// Matching uses word boundaries (\b) so substrings inside ordinary words can
// never trigger a topic (e.g. "owe" inside "allowed", "rent" inside
// "different"/"parent", "will" as an auxiliary verb).

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  offerHelp?: boolean;
}

const DISCLAIMER =
  "HAKI AI provides general legal information only and does not provide legal advice.";

// High-risk matters that must never receive a template answer.
const HIGH_RISK_PATTERNS: RegExp[] = [
  /\bcourt\b/i,
  /\bcriminal\b/i,
  /\bcharged?\b/i,
  /\btheft\b/i,
  /\bassault\b/i,
  /\bmurder\b/i,
  /\bviolence\b/i,
  /\bdivorce\b/i,
  /\bland case\b/i,
  /\binheritance\b/i,
  // Testamentary "will" only as a phrase — never the bare auxiliary verb.
  /\b(last will|my will|testament|probate|succession|letters of administration)\b/i,
];

const HIGH_RISK_ANSWER =
  "This matter may require urgent professional legal assistance. Please contact a licensed advocate or a legal aid organisation listed in our directory. " +
  DISCLAIMER;

interface TopicRule {
  id: string;
  patterns: RegExp[];
  answer: string;
}

const TOPICS: TopicRule[] = [
  {
    id: "tenant",
    patterns: [
      /\btenants?\b/i,
      /\blandlords?\b/i,
      /\bdeposits?\b/i,
      /\brent\b/i,
      /\bevict(?:ion|ed)?\b/i,
      /\btenancy\b/i,
      /\blease\b/i,
    ],
    answer:
      "In Kenya, a tenant has the right to safe and habitable accommodation, peaceful enjoyment of the property, and protection from unlawful eviction. Your landlord must follow the tenancy agreement and due process before ending a tenancy, and must return your deposit less any agreed deductions. First, review your tenancy agreement. Second, raise the issue with your landlord in writing. Third, if unresolved, send a formal demand letter or contact the Rent Restriction Tribunal. " +
      DISCLAIMER,
  },
  {
    id: "employment",
    patterns: [
      /\bemployment\b/i,
      /\bemploy(?:er|ee)s?\b/i,
      /\bdismiss(?:al|ed)?\b/i,
      /\bfired\b/i,
      /\bsalary\b/i,
      /\bwages?\b/i,
      /\bcontract of employment\b/i,
      /\bgrievance\b/i,
      /\bunfair termination\b/i,
    ],
    answer:
      "Under the Employment Act, an employee is entitled to a fair reason and a fair procedure before dismissal, and to notice or pay in lieu of notice. Keep your contract, payslips, and any related messages. Raise a formal grievance in writing first; if unresolved, send a complaint letter to your employer and consider reporting to the Ministry of Labour. " +
      DISCLAIMER,
  },
  {
    id: "consumer",
    patterns: [
      /\bconsumers?\b/i,
      /\brefund\b/i,
      /\bfaulty\b/i,
      /\bgoods\b/i,
      /\bshops?\b/i,
      /\bshopping\b/i,
      /\bseller\b/i,
      /\bwarranty\b/i,
    ],
    answer:
      "Consumers in Kenya are entitled to goods and services that are safe, of acceptable quality, and as described. For faulty goods you may be entitled to repair, replacement, or refund. Keep your receipt, contact the seller in writing stating the remedy you want, and send a formal refund request letter if there is no response. " +
      DISCLAIMER,
  },
  {
    id: "debt",
    patterns: [
      /\bdemand letters?\b/i,
      /\bowed\b/i,
      /\bdebt\b/i,
      /\bowe[sd]?\b/i,
      /\bmoney\b/i,
      /\bloan\b/i,
      /\brepayment\b/i,
      /\bdebtor\b/i,
    ],
    answer:
      "A demand letter should clearly state the amount owed, the reason, the original due date, the action you require, and a deadline (commonly 7 days). Gather your agreement and payment records first, then send the demand letter and keep proof of delivery. If the deadline passes, consult a licensed advocate about next steps. " +
      DISCLAIMER,
  },
  {
    id: "business",
    patterns: [
      /\bagreements?\b/i,
      /\bcontracts?\b/i,
      /\bbusiness(?:es)?\b/i,
      /\bservices?\b/i,
      /\bscope of work\b/i,
      /\bpartnership\b/i,
    ],
    answer:
      "A simple business service agreement should include both parties, the scope of work, price, payment schedule, timeline, and a dispute resolution clause. Both parties should review and sign, and each keep a copy. " +
      DISCLAIMER,
  },
  {
    id: "complaint",
    patterns: [/\bcomplaints?\b/i, /\bcomplain\b/i, /\bombudsman\b/i],
    answer:
      "A clear complaint letter should state the facts with dates and any reference numbers, identify the parties, specify the remedy you want, and set a reasonable deadline. Keep a copy of the letter and proof of delivery, and escalate to the relevant regulator or ombudsman if there is no response. " +
      DISCLAIMER,
  },
];

const SCOPE_ANSWER =
  "That question falls outside the six areas HAKI AI covers: Tenant Rights, Employment, Consumer Protection, Debt Recovery, Business Agreements, and Complaint Letters. " +
  "HAKI AI does not cover criminal law, family disputes, immigration, land ownership, constitutional petitions, or any other legal matter. " +
  "For this issue, please consult a licensed advocate of the High Court of Kenya or an organisation in our Legal Aid Directory. " +
  DISCLAIMER;

/**
 * Classify the exact latest user question and return the matching answer.
 * Stateless: conversation history is never consulted, so a response can only
 * ever come from the question passed in — never from a previous answer.
 */
export function getAnswer(question: string): ChatMessage {
  const text = question.trim();

  if (HIGH_RISK_PATTERNS.some((pattern) => pattern.test(text))) {
    return { role: "assistant", text: HIGH_RISK_ANSWER, offerHelp: true };
  }

  let best: TopicRule | null = null;
  let bestScore = 0;
  for (const topic of TOPICS) {
    let score = 0;
    for (const pattern of topic.patterns) {
      if (pattern.test(text)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  if (best && bestScore > 0) {
    return { role: "assistant", text: best.answer };
  }

  return { role: "assistant", text: SCOPE_ANSWER, offerHelp: true };
}
