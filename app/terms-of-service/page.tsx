import PageShell from "@/components/layout/PageShell";

const sections = [
  {
    title: "1. Acceptance of terms",
    body: "By using HAKI AI you agree to these terms. If you do not agree, please do not use the platform.",
  },
  {
    title: "2. Nature of the service",
    body: "HAKI AI is a legal information and document assistance platform. It provides general legal information only. It does not provide legal advice, does not create a lawyer-client relationship, and is not a substitute for a licensed advocate of the High Court of Kenya.",
  },
  {
    title: "3. Acceptable use",
    body: "You agree not to use HAKI AI for unlawful purposes, to submit abusive or fraudulent content, or to misrepresent generated documents as legal advice or court filings.",
  },
  {
    title: "4. Documents",
    body: "Documents are produced from fixed templates (template-based filling only). You are responsible for reviewing any generated document before use. HAKI AI does not guarantee the legal effect of any document.",
  },
  {
    title: "5. High-risk matters",
    body: "For court cases, criminal charges, domestic violence, land disputes, or large money disputes, you must seek professional legal assistance. HAKI AI will flag such matters and recommend consulting a licensed advocate.",
  },
  {
    title: "6. Availability",
    body: "The platform is provided on an 'as is' and 'as available' basis. We may modify or suspend features, including AI responses, without notice.",
  },
  {
    title: "7. Limitation of liability",
    body: "To the maximum extent permitted by law, HAKI AI is not liable for losses arising from reliance on general legal information provided by the platform.",
  },
  {
    title: "8. Contact",
    body: "Questions about these terms can be sent to michaelkariuki281@gmail.com.",
  },
];

export default function TermsOfServicePage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        The rules for using HAKI AI and the limits of the information it
        provides.
      </p>

      <div className="card-gradient mt-8 max-w-4xl rounded-xl border p-8 shadow-sm">
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-slate-900">
                {section.title}
              </h2>
              <p className="mt-2 leading-relaxed text-slate-600">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
