"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface TopicDetailProps {
  title: string;
  intro: string;
  lawPoints: string[];
  steps: string[];
  documents: string[];
  help: string;
}

export default function TopicDetail({
  title,
  intro,
  lawPoints,
  steps,
  documents,
  help,
}: TopicDetailProps) {
  const { t } = useLanguage();

  return (
    <article>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        {intro}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-gradient rounded-xl border p-8 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            {t("topic.law")}
          </h2>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed text-slate-600">
            {lawPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="card-gradient rounded-xl border p-8 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            {t("topic.steps")}
          </h2>
          <ol className="list-decimal space-y-2 pl-5 leading-relaxed text-slate-600">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="card-gradient rounded-xl border p-8 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            {t("topic.documents")}
          </h2>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed text-slate-600">
            {documents.map((document) => (
              <li key={document}>{document}</li>
            ))}
          </ul>
        </div>

        <div className="card-gradient rounded-xl border p-8 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            {t("topic.help")}
          </h2>
          <p className="leading-relaxed text-slate-600">{help}</p>
          <p className="mt-3">
            <Link
              href="/legal-aid"
              className="font-semibold text-[#c0221b] underline underline-offset-2"
            >
              {t("legalAid.getHelp")} →
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href="/document-generator"
          className="btn-gradient-primary inline-flex h-[52px] items-center gap-2 rounded-full px-8 text-[15px] font-semibold"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          {t("topic.generate")}
        </Link>
        <Link
          href="/ask"
          className="inline-flex h-[52px] items-center rounded-full border border-slate-300 px-8 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-white hover:text-slate-900"
        >
          {t("nav.ask")}
        </Link>
      </div>
    </article>
  );
}
