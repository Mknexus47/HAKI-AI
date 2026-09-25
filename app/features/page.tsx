import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import FeaturesSection from "@/components/layout/FeaturesSection";
import TopicsSection from "@/components/layout/TopicsSection";

export default function FeaturesPage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        Features
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        Everything HAKI AI can do — ask legal questions, explore legal topics,
        and generate basic documents from fixed templates.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/ask"
          className="btn-gradient-primary inline-flex h-[52px] items-center rounded-full px-8 text-[15px] font-semibold"
        >
          Ask a Legal Question
        </Link>
        <Link
          href="/document-generator"
          className="inline-flex h-[52px] items-center rounded-full border border-slate-300 px-8 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-white hover:text-slate-900"
        >
          Generate a Document
        </Link>
      </div>

      <div className="mt-8 border-b border-slate-100" />

      <FeaturesSection />
      <TopicsSection />
    </PageShell>
  );
}
