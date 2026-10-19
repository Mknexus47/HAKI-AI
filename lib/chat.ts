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
//
// Answers are available in English and Swahili; getAnswer(question, lang)
// returns the template in the selected language. Pattern matching runs on
// the raw question, so either language can trigger the right topic.

import type { Language } from "@/lib/i18n";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  offerHelp?: boolean;
}

type Bilingual = Record<Language, string>;

const DISCLAIMER: Bilingual = {
  en: "HAKI AI provides general legal information only and does not provide legal advice.",
  sw: "HAKI AI hutoa taarifa za kisheria kwa ujumla tu na haitoi ushauri wa kisheria.",
};

// High-risk matters that must never receive a template answer.
// Patterns cover both English and Swahili terms.
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
  /\bkorti\b/i,
  /\btalaka\b/i,
  /\bwizi\b/i,
  /\burithi\b/i,
  // Testamentary "will" only as a phrase — never the bare auxiliary verb.
  /\b(last will|my will|testament|probate|succession|letters of administration)\b/i,
];

const HIGH_RISK_ANSWER: Bilingual = {
  en:
    "This matter may require urgent professional legal assistance. Please contact a licensed advocate or a legal aid organisation listed in our directory. " +
    DISCLAIMER.en,
  sw:
    "Suu hili linaweza kuhitaji msaada wa kitaalamu wa haraka. Tafadhali wasiliana na advocate aliyeidhinishwa au shirika la msaada wa kisheria kilicho orodhani mwetu. " +
    DISCLAIMER.sw,
};

interface TopicRule {
  id: string;
  patterns: RegExp[];
  answer: Bilingual;
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
      /\bmpangaji\b/i,
      /\bmmiliki(?: wa nyumba)?\b/i,
      /\bupangaji\b/i,
      /\baman[ae]\b/i,
    ],
    answer: {
      en:
        "In Kenya, a tenant has the right to safe and habitable accommodation, peaceful enjoyment of the property, and protection from unlawful eviction. Your landlord must follow the tenancy agreement and due process before ending a tenancy, and must return your deposit less any agreed deductions. First, review your tenancy agreement. Second, raise the issue with your landlord in writing. Third, if unresolved, send a formal demand letter or contact the Rent Restriction Tribunal. " +
        DISCLAIMER.en,
      sw:
        "Kenya, mpangaji ana haki ya makazi salama na yanayofaa, matumizi amani ya mali, na kulindwa na kuondoshwa kinyume na sheria. Mwenye nyumba lazima afuate mkataba wa upangaji na mchakato wa haki kabla ya kumaliza upangaji, na kurudisha amana yako isipokuwa makubaliano yanayotajwa. Hatua ya kwanza: pitia mkataba wako wa upangaji. Ya pili: taja suala hilo kwa mmiliki wa nyumba kwa maandishi. Ya tatu: kama halijasuluhishwa, tuma barua rasmi ya madai au wasiliana na Tribunal ya Kuzuia Kupanda kwa Kodi. " +
        DISCLAIMER.sw,
    },
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
      /\bajira\b/i,
      /\bmwajiri\b/i,
      /\bmfanyakazi\b/i,
      /\bmishahara\b/i,
      /\bfukuzwa\b/i,
    ],
    answer: {
      en:
        "Under the Employment Act, an employee is entitled to a fair reason and a fair procedure before dismissal, and to notice or pay in lieu of notice. Keep your contract, payslips, and any related messages. Raise a formal grievance in writing first; if unresolved, send a complaint letter to your employer and consider reporting to the Ministry of Labour. " +
        DISCLAIMER.en,
      sw:
        "Chini ya Sheria ya Ajira, mfanyakazi ana haki ya sababu ya haki na mchakato wa haki kabla ya kufukuzwa, na kujulishwa kabla au malipo badala ya kujulishwa. Hifadhi mkataba wako, mishahara, na ujumbe husika. Kwanza taja malalamiko yako rasmi kwa maandishi; kama hayajasuluhishwa, tuma barua ya malalamiko kwa mwajiri wako na fikiria kuripoti Wizara ya Kazi. " +
        DISCLAIMER.sw,
    },
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
      /\bmtumiaji\b/i,
      /\bmanunuzi\b/i,
      /\bbidhaa\b/i,
      /\bmarejesho\b/i,
      /\bmuuzaji\b/i,
    ],
    answer: {
      en:
        "Consumers in Kenya are entitled to goods and services that are safe, of acceptable quality, and as described. For faulty goods you may be entitled to repair, replacement, or refund. Keep your receipt, contact the seller in writing stating the remedy you want, and send a formal refund request letter if there is no response. " +
        DISCLAIMER.en,
      sw:
        "Wanunuzi Kenya wana haki kupata bidhaa na huduma salama, zenye ubora unaokubalika, na zinazotajwa. Kwa bidhaa zilizoharibika unaweza kupata marekebisho, badiliko, au marejesho. Hifadhi risiti yako, wasiliana na muuzaji kwa maandishi ukieleza ukombozi unaoitaka, na tuma barua rasmi ya kuomba marejesho kama hakujibiwa. " +
        DISCLAIMER.sw,
    },
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
      /\bmadai\b/i,
      /\bdeni\b/i,
      /\bmkopo\b/i,
      /\binadaiwa\b/i,
    ],
    answer: {
      en:
        "A demand letter should clearly state the amount owed, the reason, the original due date, the action you require, and a deadline (commonly 7 days). Gather your agreement and payment records first, then send the demand letter and keep proof of delivery. If the deadline passes, consult a licensed advocate about next steps. " +
        DISCLAIMER.en,
      sw:
        "Barua ya madai inapaswa kueleza wazi kiasi kinachodaiwa, sababu, tarehe halisi ya malipo, kitendo unachotaka, na muda wa mwisho (kawaida ni siku 7). Kwanza kukusanya mkataba wako na rekodi za malipo, kisha tuma barua ya madai na uhifadhi uthibitisho wa kupeleka. Baada ya muda wa mwisho kupita, wasiliana na advocate aliyeidhinishwa kuhusu hatua zinazofuata. " +
        DISCLAIMER.sw,
    },
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
      /\bmkataba\b/i,
      /\bbiashara\b/i,
      /\bhuduma\b/i,
    ],
    answer: {
      en:
        "A simple business service agreement should include both parties, the scope of work, price, payment schedule, timeline, and a dispute resolution clause. Both parties should review and sign, and each keep a copy. " +
        DISCLAIMER.en,
      sw:
        "Mkataba rahisi wa huduma za biashara unapaswa kujumuisha pande zote mbili, kazi ya kufanywa, bei, ratiba ya malipo, muda, na kifungu cha kutatua migogoro. Pande zote zinapaswa kusoma na kusaini, na kila mmoja ahifadhi nakala. " +
        DISCLAIMER.sw,
    },
  },
  {
    id: "complaint",
    patterns: [
      /\bcomplaints?\b/i,
      /\bcomplain\b/i,
      /\bombudsman\b/i,
      /\blalamiko\b/i,
      /\bmalalamiko\b/i,
      /\bkilalamu\b/i,
    ],
    answer: {
      en:
        "A clear complaint letter should state the facts with dates and any reference numbers, identify the parties, specify the remedy you want, and set a reasonable deadline. Keep a copy of the letter and proof of delivery, and escalate to the relevant regulator or ombudsman if there is no response. " +
        DISCLAIMER.en,
      sw:
        "Barua ya malalamiko yenye uwazi inapaswa kueleza ukweli na tarehe na namba za kumbukumbu, kutambua pande, kueleza ukombozi unaouomba, na kuweka muda unaofaa. Hifadhi nakala ya barua na uthibitisho wa kupeleka, na panda ngazi kwa mamlaka husika kama hakujibiwa. " +
        DISCLAIMER.sw,
    },
  },
];

const SCOPE_ANSWER: Bilingual = {
  en:
    "That question falls outside the six areas HAKI AI covers: Tenant Rights, Employment, Consumer Protection, Debt Recovery, Business Agreements, and Complaint Letters. " +
    "HAKI AI does not cover criminal law, family disputes, immigration, land ownership, constitutional petitions, or any other legal matter. " +
    "For this issue, please consult a licensed advocate of the High Court of Kenya or an organisation in our Legal Aid Directory. " +
    DISCLAIMER.en,
  sw:
    "Swali hili linatoka nje ya maeneo sita yanayofunikwa na HAKI AI: Haki za Mapangaji, Ajira, Ulinzi wa Mtumiaji, Ukusanyaji wa Madai, Mikataba ya Biashara, na Barua za Malalamiko. " +
    "HAKI AI haifuniki sheria ya jinai, migogoro ya familia, uhamiaji, umiliki wa ardhi, maombi ya katiba, wala suala lingine lolote la kisheria. " +
    "Kwa suala hili, tafadhali wasiliana na Advocate wa Mahakama Kuu ya Kenya aliyeidhinishwa au shirika katika Orodha yetu ya Msaada wa Kisheria. " +
    DISCLAIMER.sw,
};

// Friendly greetings / small talk that should never receive the
// "out of scope" answer. Word boundaries (\b) and ^ anchors are used so
// substrings inside ordinary words can never trigger (e.g. "hi" inside
// "this", "hey" inside "they", "yo" inside "your").
const GREETING_PATTERNS: RegExp[] = [
  /^(hi+|hello+|hey+|hii+|yo|sup|howdy|greetings|good\s?(morning|afternoon|evening|day))\b/i,
  /^(habari|hujambo|jambo|mambo|vipi|niaje|sasa|shikamoo|karibu|hallo|asante)\b/i,
  /\bhow are you\b/i,
  /\bwho are you\b/i,
  /\bwhat can you (do|help)(\s+with)?\b/i,
  /\bwhat do you do\b/i,
  /\bthank(s| you)\b/i,
  /\basante\b/i,
  /^(bye|goodbye|goodnight|later|ciao)\b/i,
  /^(help|help me|please help)\b/i,
];

const GREETING_ANSWER: Bilingual = {
  en:
    "Hello! I'm HAKI AI, your legal information assistant for Kenya. " +
    "I can share general information on six areas: Tenant Rights, Employment, Consumer Protection, Debt Recovery, Business Agreements, and Complaint Letters. " +
    'Ask me a question in plain language — for example: "What are my rights as a tenant?" ' +
    DISCLAIMER.en,
  sw:
    "Habari! Mimi ni HAKI AI, msaidizi wako wa taarifa za kisheria kwa Kenya. " +
    "Ninaweza kutoa taarifa za ujumla kwa maeneo sita: Haki za Mapangaji, Ajira, Ulinzi wa Mtumiaji, Ukusanyaji wa Madai, Mikataba ya Biashara, na Barua za Malalamiko. " +
    'Uliza swali lako kwa lugha rahisi — mfano: "Ni haki gani nina kama mpangaji?" ' +
    DISCLAIMER.sw,
};

/**
 * True when the question matches a high-risk pattern. High-risk questions
 * never reach the LLM — the server returns the fixed referral template.
 */
export function isHighRiskQuestion(question: string): boolean {
  return HIGH_RISK_PATTERNS.some((pattern) => pattern.test(question.trim()));
}

/** True when the question matches at least one of the six in-scope topics. */
export function hasTopicMatch(question: string): boolean {
  const text = question.trim();
  return TOPICS.some((topic) =>
    topic.patterns.some((pattern) => pattern.test(text))
  );
}

/** True for greetings/small talk — always answered with a fixed template. */
export function isGreetingText(question: string): boolean {
  return GREETING_PATTERNS.some((pattern) => pattern.test(question.trim()));
}

/**
 * Classify the exact latest user question and return the matching answer
 * in the selected language (default English).
 * Stateless: conversation history is never consulted, so a response can only
 * ever come from the question passed in — never from a previous answer.
 */
export function getAnswer(
  question: string,
  lang: Language = "en"
): ChatMessage {
  const text = question.trim();

  if (HIGH_RISK_PATTERNS.some((pattern) => pattern.test(text))) {
    return { role: "assistant", text: HIGH_RISK_ANSWER[lang], offerHelp: true };
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
    return { role: "assistant", text: best.answer[lang] };
  }

  if (GREETING_PATTERNS.some((pattern) => pattern.test(text))) {
    return { role: "assistant", text: GREETING_ANSWER[lang] };
  }

  return { role: "assistant", text: SCOPE_ANSWER[lang], offerHelp: true };
}
