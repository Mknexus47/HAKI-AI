// Plain-language clause highlighting for OCR-extracted contract text.
//
// This is NOT legal analysis and NOT a substitute for professional review.
// It scans extracted text with conservative keyword patterns and attaches
// a short, general note (English + Swahili) for clauses that commonly need
// attention. Nothing here cites law or validates enforceability — the
// notes only tell the user what to check and when to involve an advocate.

import type { Language } from "@/lib/i18n";

export interface ClauseRule {
  id: string;
  title: Record<Language, string>;
  note: Record<Language, string>;
  patterns: RegExp[];
}

export const CLAUSE_RULES: ClauseRule[] = [
  {
    id: "deposit",
    title: { en: "Deposit / security", sw: "Amana / dhamana" },
    note: {
      en: "Check how much deposit is required, when it must be returned, and what deductions are allowed. Keep proof of payment.",
      sw: "Kiasi cha amana kinachohitajika, lini kurudishwa, na nini kinakatwa kwa ruhusa. Hifadhi uthibitisho wa malipo.",
    },
    patterns: [/\bdeposits?\b/i, /\bsecurity deposit\b/i, /\baman[ae]\b/i],
  },
  {
    id: "notice-termination",
    title: {
      en: "Notice / termination",
      sw: "Kujulishwa / kumaliza mkataba",
    },
    note: {
      en: "Ending an agreement usually requires written notice and a lawful procedure. Check the notice period before signing.",
      sw: "Kumaliza mkataba kawaida huhitaji kujulishwa kwa maandishi na mchakato wa sheria. Angalia muda wa kujulishwa kabla ya kusaini.",
    },
    patterns: [
      /\bnotice\b/i,
      /\bterminat/i,
      /\bevict/i,
      /\bend(?:ing)? (?:the )?(?:agreement|contract|tenancy)\b/i,
    ],
  },
  {
    id: "payment",
    title: { en: "Payment terms", sw: "Masharti ya malipo" },
    note: {
      en: "Record the exact amounts, due dates, and payment method. Keep receipts or mobile-money confirmations for every payment.",
      sw: "Rekisha kiasi halisi, tarehe za malipo, na njia ya malipo. Hifadhi risiti au uthibitisho wa malipo ya simu kila unapolipa.",
    },
    patterns: [
      /\bpayments?\b/i,
      /\bpay\b/i,
      /\binvoice\b/i,
      /\bdue (?:date|on)\b/i,
      /\bmalipo\b/i,
    ],
  },
  {
    id: "penalty-interest",
    title: {
      en: "Penalty / interest on late payment",
      sw: "Faini / riba kwa malipo ya kuchelewa",
    },
    note: {
      en: "Penalty or interest clauses can have real financial cost. Check the rate and get independent advice before signing anything with heavy penalties.",
      sw: "Vifungu vya faini au riba vinaweza kusababisha gharama kubwa. Angalia kiwango na pata ushauri huru kabla ya kusaini kitu chenye faini kubwa.",
    },
    patterns: [
      /\bpenalt/i,
      /\binterest\b/i,
      /\bfines?\b/i,
      /\blate payment\b/i,
      /\bfaini\b/i,
    ],
  },
  {
    id: "warranty-defects",
    title: {
      en: "Warranty / defects",
      sw: "Dhamana / uharibifu",
    },
    note: {
      en: "For faulty goods, statutory consumer rights may apply regardless of a written warranty. Keep the receipt and report defects promptly in writing.",
      sw: "Kwa bidhaa zilizoharibika, haki za kisheria za mtumiaji zinaweza kutumika bila kujali dhamana iliyosandikwa. Hifadhi risiti na ripoti uharibifu mapema kwa maandishi.",
    },
    patterns: [/\bwarrant/i, /\bdefects?\b/i, /\bfaults?\b/i, /\bdhamana\b/i],
  },
  {
    id: "rent-tenancy",
    title: { en: "Rent / tenancy terms", sw: "Masharti ya kodi / upangaji" },
    note: {
      en: "Check the rent amount, when it may be increased, repair duties, and how the deposit is handled. Use the Tenancy Agreement generator for a basic written agreement.",
      sw: "Angalia kiasi cha kodi, lini kinaweza kupanda, wajibu wa marekebisho, jinsi amana inavyoshughulikiwa. Tumia kizalishaji cha Mkataba wa Upangaji kupata mkataba rahisi wa maandishi.",
    },
    patterns: [
      /\brent\b/i,
      /\blandlords?\b/i,
      /\btenants?\b/i,
      /\bpremises\b/i,
      /\bupangaji\b/i,
    ],
  },
  {
    id: "confidentiality",
    title: {
      en: "Confidentiality",
      sw: "Ufaraja / siri",
    },
    note: {
      en: "Confidentiality obligations often continue after the agreement ends. Check what information is covered and for how long.",
      sw: "Wajibu wa kusiri mara nyingine huendelea baada ya mkataba kuisha. Angalia taarifa zipi zimejumuishwa na kwa muda gani.",
    },
    patterns: [/\bconfidential/i, /\bnon-disclosure\b/i, /\bsiri\b/i],
  },
  {
    id: "dispute-forum",
    title: {
      en: "Dispute resolution / governing law",
      sw: "Kutatua migogoro / sheria inayotumika",
    },
    note: {
      en: "Check where disputes will be resolved (court, tribunal, or arbitration) and under which law — this affects cost and your access to justice.",
      sw: "Angalia migogoro itatolewa wapi (mahakama, tribunal, au arbitration) na chini ya sheria ipi — hii inaugharama na upatikanaji wako wa haki.",
    },
    patterns: [
      /\bgoverning law\b/i,
      /\bjurisdiction\b/i,
      /\barbitration\b/i,
      /\bdispute resolution\b/i,
      /\bmigogoro\b/i,
    ],
  },
  {
    id: "parties-signature",
    title: {
      en: "Parties and signatures",
      sw: "Pande na saini",
    },
    note: {
      en: "Confirm both parties' full names are correct, each signs, and each keeps a copy. An unsigned agreement may be hard to enforce.",
      sw: "Hakikisha majina kamili ya pande zote mbili ni sahihi, kila mmoja anasaini, na kila mmoja anahifadhi nakala. Mkataba usiosainiwa unaweza kuwa mgumu kutekelezwa.",
    },
    patterns: [
      /\bsignature(s)?\b/i,
      /\bsigned\b/i,
      /\bparties\b/i,
      /\bsaini\b/i,
    ],
  },
];

export interface ClauseFinding {
  rule: ClauseRule;
  excerpt: string;
}

/**
 * Split extracted text into rough sentences and return at most one excerpt
 * per clause rule whose pattern matches. Deterministic; no AI involved.
 */
export function analyseClauses(text: string): ClauseFinding[] {
  const normalised = text.replace(/\s+/g, " ").trim();
  if (!normalised) return [];
  const sentences = normalised
    .split(/(?<=[.;!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  const findings: ClauseFinding[] = [];
  for (const rule of CLAUSE_RULES) {
    const hit = sentences.find((sentence) =>
      rule.patterns.some((pattern) => pattern.test(sentence))
    );
    if (hit) {
      findings.push({
        rule,
        excerpt: hit.length > 240 ? `${hit.slice(0, 240)}…` : hit,
      });
    }
  }
  return findings;
}
