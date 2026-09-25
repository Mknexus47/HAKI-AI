export interface LegalAidOrg {
  id: string;
  name: string;
  focus: string;
  location: string;
  phone: string;
  phoneHref: string;
  email: string;
  website: string;
}

// Curated, verified contact details for Kenyan legal aid organisations.
// Update via admin panel content review or edit this file directly.
export const legalAidOrgs: LegalAidOrg[] = [
  {
    id: "kituo",
    name: "Kituo cha Sheria",
    focus:
      "Oldest legal aid NGO in Kenya — housing, land, labour, refugee and criminal legal aid, plus mobile legal aid clinics.",
    location: "Ole Odume Rd, Off Argwings Kodhek Rd, Nairobi",
    phone: "+254 20 387 4191",
    phoneHref: "+254203874191",
    email: "info@kituochasheria.or.ke",
    website: "https://kituochasheria.or.ke",
  },
  {
    id: "fida",
    name: "FIDA Kenya (Federation of Women Lawyers)",
    focus:
      "Free legal aid for women and children — family law, gender-based violence, succession and land matters.",
    location: "Amboseli Rd off Gitanga Rd, Lavington, Nairobi",
    phone: "+254 20 387 3511",
    phoneHref: "+254203873511",
    email: "info@fidakenya.org",
    website: "https://fidakenya.org",
  },
  {
    id: "lsk",
    name: "Law Society of Kenya — Pro Bono & Public Interest",
    focus:
      "Pro bono advocate database and case referrals for people who cannot afford legal representation.",
    location: "South C, Off Red Cross Rd, Nairobi",
    phone: "+254 111 231 010",
    phoneHref: "+254111231010",
    email: "lsk@lsk.or.ke",
    website: "https://lsk.or.ke",
  },
  {
    id: "nlas",
    name: "National Legal Aid Service (NLAS)",
    focus:
      "Government legal aid — duty stations countrywide, advice, mediation and duty advocate schemes.",
    location: "Kenya Charity Sweepstake House, Nairobi",
    phone: "0800 720 640 (toll free)",
    phoneHref: "0800720640",
    email: "info@nlas.go.ke",
    website: "https://nlas.go.ke",
  },
  {
    id: "gbv",
    name: "Gender Violence Recovery Centre Helpline",
    focus:
      "24/7 support for survivors of gender-based violence — medical, psychosocial and legal referral.",
    location: "Nationwide toll-free helpline",
    phone: "1195 (toll free)",
    phoneHref: "1195",
    email: "",
    website: "https://www.akuhn.org",
  },
];
