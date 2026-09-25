"use client";

import * as React from "react";
import { Mail, MapPin, Phone, Globe, Check } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import { legalAidOrgs } from "@/lib/legal-aid";
import { useLanguage } from "@/components/language-provider";

export default function LegalAidPage() {
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyFeedback = (id: string, value: string) => {
    void navigator.clipboard?.writeText(value).catch(() => undefined);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 2000);
  };

  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        {t("legalAid.title")}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        {t("legalAid.intro")}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {legalAidOrgs.map((org) => (
          <div
            key={org.id}
            className="card-gradient flex flex-col rounded-xl border p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              {org.name}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              {org.focus}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                {org.location}
              </li>
              <li className="flex items-center gap-2">
                <Phone
                  className="h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <a
                  href={`tel:${org.phoneHref}`}
                  onClick={() => copyFeedback(`${org.id}-phone`, org.phone)}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {org.phone}
                </a>
                {copied === `${org.id}-phone` ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <Check className="h-3 w-3" aria-hidden="true" />
                    Copied
                  </span>
                ) : null}
              </li>
              {org.email ? (
                <li className="flex items-center gap-2">
                  <Mail
                    className="h-4 w-4 shrink-0 text-slate-400"
                    aria-hidden="true"
                  />
                  <a
                    href={`mailto:${org.email}`}
                    onClick={() => copyFeedback(`${org.id}-email`, org.email)}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {org.email}
                  </a>
                  {copied === `${org.id}-email` ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check className="h-3 w-3" aria-hidden="true" />
                      Copied
                    </span>
                  ) : null}
                </li>
              ) : null}
              <li className="flex items-center gap-2">
                <Globe
                  className="h-4 w-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#c0221b] hover:underline"
                >
                  Website
                </a>
              </li>
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-slate-500">
        Contact details were verified from each organisation&apos;s official
        website. HAKI AI does not employ these organisations — always confirm
        office hours before visiting. On mobile, tapping a number dials it and
        tapping an email opens your mail app; on desktop the contact is copied
        to your clipboard.
      </p>
    </PageShell>
  );
}
