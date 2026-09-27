export type Language = "en" | "sw";

const en = {
  "nav.home": "Home",
  "nav.topics": "Legal Topics",
  "nav.documents": "Document Generator",
  "nav.about": "About",
  "nav.ask": "Ask a Question",
  "nav.blog": "Blog",
  "auth.login": "Login",
  "auth.signup": "Sign Up",
  "auth.signout": "Sign out",
  "common.contact": "Contact Us",
  "common.backHome": "Back to Home",
  "common.download": "Download PDF",
  "common.send": "Send",
  "common.langLabel": "Language",
  "disclaimer":
    "⚠️ Important: HAKI AI provides general legal information only. It does not provide legal advice or create a lawyer-client relationship. For serious matters, please consult a licensed Advocate of the High Court of Kenya.",
  "disclaimer.sw":
    "⚠️ Muhimu: HAKI AI hutoa taarifa za kisheria kwa ujumla tu. Haiutoi ushauri wa kisheria wala kuunda uhusiano wa mawakili. Kwa masuala mazito, tafadhali wasiliana na Advocate wa Mahakama Kuu ya Kenya aliyeidhinishwa.",
  "scope.limitation":
    "⚠️ SCOPE LIMITATION: HAKI AI provides general information on five specific legal rights areas only: Tenant Rights, Employment, Consumer Protection, Debt Recovery, and Business Agreements. It does not cover criminal law, family disputes, immigration, land ownership, constitutional petitions, or any other legal matter. This is not legal advice. For issues outside these areas, please consult a qualified advocate or use our Legal Aid Directory.",
  "hero.title": "Access to Justice, Simplified.",
  "hero.subtitle":
    "Your cloud-powered legal information assistant for Kenya. Get plain-language explanations and generate basic legal documents in minutes.",
  "hero.ask": "Ask a Legal Question",
  "hero.generate": "Generate a Document",
  "ask.title": "AI Legal Assistant",
  "ask.intro":
    "Ask simple legal questions and get plain-language answers based on curated Kenyan legal information.",
  "ask.placeholder": "Ask a legal question...",
  "ask.greeting":
    "Hello — ask me a legal information question in plain English, for example: \"What are my rights as a tenant?\"",
  "ask.offline":
    "Chat unavailable offline. View saved documents/topics instead.",
  "ask.disclaimer":
    "Responses are educational only. For serious matters, consult a licensed advocate of the High Court of Kenya.",
  "feedback.title": "Was this helpful?",
  "feedback.thanks": "Thanks for your feedback.",
  "feedback.tooComplex": "Too complex",
  "feedback.inaccurate": "Inaccurate",
  "feedback.missingSteps": "Missing steps",
  "feedback.other": "Other",
  "feedback.submit": "Submit",
  "feedback.privacy": "Do not include personal case details.",
  "legalAid.title": "Legal Aid Directory",
  "legalAid.intro":
    "Verified Kenyan legal aid organisations offering free or affordable legal help.",
  "legalAid.getHelp": "Get free legal help",
  "dashboard.title": "My Dashboard",
  "dashboard.history": "Document history",
  "dashboard.drafts": "Continue a draft",
  "dashboard.empty": "No documents yet. Generated documents will appear here.",
  "dashboard.noDrafts": "No saved drafts yet.",
  "dashboard.date": "Date",
  "dashboard.type": "Type",
  "dashboard.status": "Status",
  "dashboard.actions": "Actions",
  "dashboard.download": "Download",
  "dashboard.delete": "Delete",
  "dashboard.allTypes": "All types",
  "dashboard.loginRequired": "Please log in to view your dashboard.",
  "offline.banner":
    "You are offline. Saved topics and documents are still available.",
  "moderation.paused":
    "Your request was paused for safety review. Contact support if this is an error.",
  "moderation.banned":
    "Your access has been temporarily paused after repeated flagged requests. Please contact support.",
  "topic.law": "What the law generally says",
  "topic.steps": "Steps you can take",
  "topic.documents": "Documents you may need",
  "topic.help": "Where to seek official help",
  "topic.generate": "Generate a related document",
};

export type TranslationKey = keyof typeof en;

const sw: Record<TranslationKey, string> = {
  "nav.home": "Nyumbani",
  "nav.topics": "Mada za Kisheria",
  "nav.documents": "Kizalishaji Hati",
  "nav.about": "Kuhusu",
  "nav.ask": "Uliza Swali",
  "nav.blog": "Blogu",
  "auth.login": "Ingia",
  "auth.signup": "Jisajili",
  "auth.signout": "Toka",
  "common.contact": "Wasiliana Nasi",
  "common.backHome": "Rudi Nyumbani",
  "common.download": "Pakua PDF",
  "common.send": "Tuma",
  "common.langLabel": "Lugha",
  "disclaimer":
    "⚠️ Muhimu: HAKI AI hutoa taarifa za kisheria kwa ujumla tu. Haiutoi ushauri wa kisheria wala kuunda uhusiano wa mawakili. Kwa masuala mazito, tafadhali wasiliana na Advocate wa Mahakama Kuu ya Kenya aliyeidhinishwa.",
  "disclaimer.sw":
    "⚠️ Important: HAKI AI provides general legal information only. It does not provide legal advice or create a lawyer-client relationship. For serious matters, please consult a licensed Advocate of the High Court of Kenya.",
  "scope.limitation":
    "⚠️ SCOPE LIMITATION: HAKI AI provides general information on five specific legal rights areas only: Tenant Rights, Employment, Consumer Protection, Debt Recovery, and Business Agreements. It does not cover criminal law, family disputes, immigration, land ownership, constitutional petitions, or any other legal matter. This is not legal advice. For issues outside these areas, please consult a qualified advocate or use our Legal Aid Directory.",
  "hero.title": "Upatikanaji wa Haki, Kwa Urahisi.",
  "hero.subtitle":
    "Msaada wako wa taarifa za kisheria uliojengwa wingu kwa Kenya. Paelezo kwa lugha rahisi na utengeneze hati za kisheria za msingi ndani ya dakika chache.",
  "hero.ask": "Uliza Swali la Kisheria",
  "hero.generate": "Tengeneza Hati",
  "ask.title": "Msaada wa Kisheria wa AI",
  "ask.intro":
    "Uliza masuala rahisi ya kisheria upate majibu kwa lugha rahisi kutokana na taarifa za kisheria za Kenya.",
  "ask.placeholder": "Uliza swali la kisheria...",
  "ask.greeting":
    "Karibu — uliza swali la taarifa za kisheria kwa lugha rahisi, mfano: \"Ni haki gani nina kama mpangaji?\"",
  "ask.offline":
    "Mazungumzo hayapatikani bila mtandao. Angalia hati/mada ulizohifadhi badala yake.",
  "ask.disclaimer":
    "Majibu ni ya kielimu tu. Kwa masuala mazito, wasiliana na Advocate wa Mahakama Kuu ya Kenya aliyeidhinishwa.",
  "feedback.title": "Je, hii ilisaidia?",
  "feedback.thanks": "Asante kwa maoni yako.",
  "feedback.tooComplex": "Ngumu mno",
  "feedback.inaccurate": "Sahihi siyo",
  "feedback.missingSteps": "Hatua zimekosekana",
  "feedback.other": "Nyingine",
  "feedback.submit": "Wasilisha",
  "feedback.privacy": "Usijumushe maelezo ya kesi yako binafsi.",
  "legalAid.title": "Orodha ya Msaada wa Kisheria",
  "legalAid.intro":
    "Mashirika ya kisheria ya Kenya yaliyothibitishwa yanayotoa msaada wa kisheria bure au kwa gharama nafuu.",
  "legalAid.getHelp": "Pata msaada wa bure",
  "dashboard.title": "Dashibodi Yangu",
  "dashboard.history": "Historia ya hati",
  "dashboard.drafts": "Endelea na rasimu",
  "dashboard.empty": "Hati hazijatengenezwa bado. Hati zilizotengenezwa zitaonekana hapa.",
  "dashboard.noDrafts": "Hakuna rasimu zilizohifadhiwa bado.",
  "dashboard.date": "Tarehe",
  "dashboard.type": "Aina",
  "dashboard.status": "Hali",
  "dashboard.actions": "Vitendo",
  "dashboard.download": "Pakua",
  "dashboard.delete": "Futa",
  "dashboard.allTypes": "Aina zote",
  "dashboard.loginRequired": "Tafadhali ili uone dashibodi yako.",
  "offline.banner":
    "Uko nje ya mtandao. Mada na hati ulizohifadhi bado zinapatikana.",
  "moderation.paused":
    "Ombi lako limesimamishwa kwa ukaguzi wa usalama. Wasiliana na msaada kama hii ni hitilafu.",
  "moderation.banned":
    "Ufikiaji wako umesimamishwa kwa muda baada ya maombi mengi yaliyokaguliwa. Tafadhali wasiliana na msaada.",
  "topic.law": "Sheria kwa ujumla inasema nini",
  "topic.steps": "Hatua unazoweza kuchukua",
  "topic.documents": "Hati unazoweza kuhitaji",
  "topic.help": "Mahali pa kupata msaada rasmi",
  "topic.generate": "Tengeneza hati inayohusiana",
};

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  sw,
};
