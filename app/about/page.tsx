import { ShieldCheck, Languages, Cloud } from "lucide-react";
import PageShell from "@/components/layout/PageShell";

const values = [
  {
    icon: ShieldCheck,
    title: "Safety First",
    description:
      "We provide general legal information only — never legal advice. Disclaimers appear across the platform, and high-risk matters are directed to licensed advocates.",
  },
  {
    icon: Languages,
    title: "Plain Language",
    description:
      "Complex legal jargon is broken into simple steps anyone can follow, so more Kenyans can understand their rights.",
  },
  {
    icon: Cloud,
    title: "Cloud-Hosted",
    description:
      "Hosted on Vercel with Supabase for authentication and data, so HAKI AI is available 24/7 on any device.",
  },
];

export default function AboutPage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        About HAKI AI
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        HAKI AI is a cloud-hosted, AI-powered legal information and document
        assistance platform for Kenya. Our mission is to enhance access to
        justice by giving everyday Kenyans clear, trustworthy legal
        information and simple document templates.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {values.map((value) => {
          const Icon = value.icon;
          return (
            <div
              key={value.title}
              className="card-gradient rounded-xl border p-8 shadow-sm"
            >
              <div
                className="icon-gradient mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm"
                aria-hidden="true"
              >
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-slate-900">
                {value.title}
              </h2>
              <p className="leading-relaxed text-slate-600">
                {value.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="card-gradient mt-8 rounded-xl border p-8 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">
          Our safety approach
        </h2>
        <ul className="list-disc space-y-2 pl-5 leading-relaxed text-slate-600">
          <li>
            HAKI AI provides general legal information only — it does not
            provide legal advice.
          </li>
          <li>
            Using HAKI AI does not create a lawyer-client relationship.
          </li>
          <li>
            Documents are generated from fixed templates (template-based
            filling only), never raw AI drafting.
          </li>
          <li>
            High-risk matters (court cases, criminal charges, land disputes)
            are flagged and redirected to a licensed advocate.
          </li>
          <li>
            We avoid storing sensitive personal data beyond what is necessary.
          </li>
        </ul>
      </div>

      <div className="card-gradient mt-8 rounded-xl border p-8 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold text-slate-900">
          Team &amp; academic context
        </h2>
        <p className="leading-relaxed text-slate-600">
          HAKI AI is designed and developed as a final-year project in software
          engineering, combining AI integration, cloud hosting, authentication,
          and document generation into one responsible MVP. The team includes
          the project developer, supervisor, and reviewers, working with public
          legal information sources such as the Constitution of Kenya, Kenya
          Law, and the National Council for Law Reporting.
        </p>
      </div>
    </PageShell>
  );
}
