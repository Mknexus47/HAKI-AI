import { Calendar, ChevronRight } from "lucide-react";
import PageShell from "@/components/layout/PageShell";

const posts = [
  {
    title: "Understanding Your Rights as a Tenant in Kenya",
    excerpt:
      "A plain-language overview of tenancy agreements, deposits, and what to do before an eviction.",
    date: "January 2026",
  },
  {
    title: "What a Good Demand Letter Should Include",
    excerpt:
      "The five essentials every demand letter needs — amount, reason, deadline, evidence, and signature.",
    date: "February 2026",
  },
  {
    title: "Legal Information vs. Legal Advice: Why the Difference Matters",
    excerpt:
      "How HAKI AI keeps you informed while staying firmly on the right side of legal boundaries.",
    date: "March 2026",
  },
];

export default function BlogPage() {
  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Blog</h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        Plain-language articles about everyday legal rights in Kenya.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.title}
            className="card-gradient group flex flex-col rounded-xl border p-8 shadow-sm"
          >
            <p className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {post.date}
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              {post.title}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
              {post.excerpt}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-700">
              Coming soon
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
