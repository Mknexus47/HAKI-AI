"use client";

import * as React from "react";
import { HelpCircle, Scale } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import { createClient } from "@/lib/supabase-client";

interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  position: number;
}

export default function FaqPage() {
  const [entries, setEntries] = React.useState<FaqEntry[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase
      .from("faq_entries")
      .select("id, question, answer, category, position")
      .eq("published", true)
      .order("position")
      .then(({ data, error: queryError }) => {
        if (queryError) {
          setEntries([]);
          setError(
            "FAQ content is not available yet. The site administrator needs to run the FAQ database migration."
          );
          return;
        }
        setEntries((data as FaqEntry[]) ?? []);
      });
  }, []);

  const categories: { name: string; rows: FaqEntry[] }[] = [];
  for (const entry of entries ?? []) {
    const bucket = categories.find((item) => item.name === entry.category);
    if (bucket) bucket.rows.push(entry);
    else categories.push({ name: entry.category, rows: [entry] });
  }

  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        Frequently Asked Questions
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        Quick answers about how HAKI AI works, what it can do, and how your data
        is handled.
      </p>

      {error ? (
        <p className="mt-8 max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      {entries === null && !error ? (
        <p className="mt-8 text-sm text-slate-500">Loading FAQs…</p>
      ) : null}

      {categories.map((group) => (
        <section key={group.name} className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <HelpCircle className="h-4 w-4 text-[#e5342b]" aria-hidden="true" />
            {group.name}
          </h2>
          <div className="mt-4 space-y-3">
            {group.rows.map((entry) => (
              <details
                key={entry.id}
                className="card-gradient group rounded-xl border px-5 py-4 shadow-sm"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800 marker:hidden">
                  <span className="mr-2 text-slate-400">＋</span>
                  {entry.question}
                </summary>
                <p className="mt-3 border-t border-slate-200 pt-3 text-sm leading-relaxed text-slate-600">
                  {entry.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      ))}

      {entries && entries.length === 0 && !error ? (
        <p className="mt-8 text-sm text-slate-500">No FAQs published yet.</p>
      ) : null}

      <div className="mt-10 flex max-w-3xl items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-600">
        <Scale className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <p>
          HAKI AI provides general legal information only — not legal advice —
          and does not create a lawyer-client relationship. For serious matters,
          consult a licensed Advocate of the High Court of Kenya.
        </p>
      </div>
    </PageShell>
  );
}
