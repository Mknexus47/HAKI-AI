import PageShell from "@/components/layout/PageShell";

const sections = [
  {
    title: "1. Information we collect",
    body: "HAKI AI collects only the information needed to operate the platform: account details you provide (name and email), questions you ask the assistant, and data you enter into document forms. We avoid collecting sensitive personal information beyond what is strictly necessary.",
  },
  {
    title: "2. How we use information",
    body: "Information is used to provide legal information responses, generate documents, maintain account security, and improve the platform. We do not sell your personal data.",
  },
  {
    title: "3. Document storage",
    body: "Documents are generated directly in your browser from fixed templates. Where you are not logged in, documents are not stored on our servers. Logged-in document requests may be stored for account history and can be deleted on request.",
  },
  {
    title: "4. AI and third-party services",
    body: "AI responses are provided through established AI APIs and are processed under their respective privacy terms. Hosting is provided by Vercel and data services by Supabase, both of which process data under their own security and privacy commitments.",
  },
  {
    title: "5. Data security",
    body: "We use industry-standard encryption in transit, access controls, and role-based administration. Despite this, no system can guarantee absolute security, and you should avoid entering unnecessarily sensitive information.",
  },
  {
    title: "6. Your rights",
    body: "You may request access to, correction of, or deletion of your personal data by contacting support@haki-ai.co.ke.",
  },
  {
    title: "7. Cookies",
    body: "HAKI AI uses only essential cookies required for authentication and session management. We do not use advertising cookies.",
  },
  {
    title: "8. Changes and contact",
    body: "We may update this policy from time to time. Questions about privacy can be sent to support@haki-ai.co.ke.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        How HAKI AI handles your information when you ask questions or
        generate documents.
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
