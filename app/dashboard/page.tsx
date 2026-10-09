"use client";

import * as React from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  LayoutDashboard,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/layout/PageShell";
import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/components/language-provider";
import { downloadPdf } from "@/lib/pdf";
import {
  DOCUMENT_EDIT_PATHS,
  DOCUMENT_PDF_TITLES,
  DOCUMENT_TITLES,
  buildParagraphsForDoc,
  type GenericForm,
} from "@/lib/documents";

interface DocumentRow {
  id: string;
  doc_type: string;
  title: string;
  status: string;
  form_data: GenericForm | null;
  created_at: string;
}

interface DraftRow {
  id: string;
  doc_type: string;
  updated_at: string;
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [ready, setReady] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [documents, setDocuments] = React.useState<DocumentRow[]>([]);
  const [drafts, setDrafts] = React.useState<DraftRow[]>([]);
  const [filter, setFilter] = React.useState("all");

  React.useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      if (cancelled) return;
      setUserId(uid);
      if (!uid) {
        setReady(true);
        return;
      }
      const [docs, draftRows] = await Promise.all([
        supabase
          .from("documents")
          .select("id, doc_type, title, status, form_data, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("document_requests")
          .select("id, doc_type, updated_at")
          .order("updated_at", { ascending: false }),
      ]);
      if (cancelled) return;
      setDocuments((docs.data as DocumentRow[]) ?? []);
      setDrafts((draftRows.data as DraftRow[]) ?? []);
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered =
    filter === "all"
      ? documents
      : documents.filter((doc) => doc.doc_type === filter);

  const handleDownload = (doc: DocumentRow) => {
    if (!doc.form_data) return;
    const today = new Date(doc.created_at).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    downloadPdf(`haki-ai-${doc.doc_type}.pdf`, buildParagraphsForDoc(doc.doc_type, doc.form_data, today), {
      title:
        DOCUMENT_PDF_TITLES[doc.doc_type] ??
        DOCUMENT_TITLES[doc.doc_type] ??
        doc.doc_type,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this document from your history?")) return;
    const supabase = createClient();
    await supabase.from("documents").delete().eq("id", id);
    setDocuments((current) => current.filter((doc) => doc.id !== id));
  };

  if (ready && !userId) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md text-center">
          <span className="icon-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm">
            <LayoutDashboard className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="text-3xl font-bold text-slate-900">
            {t("dashboard.title")}
          </h1>
          <p className="mt-4 text-slate-600">{t("dashboard.loginRequired")}</p>
          <Button asChild className="btn-gradient-primary mt-6 rounded-full px-8">
            <Link href="/login">{t("auth.login")}</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        {t("dashboard.title")}
      </h1>

      {/* Continue Draft */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          {t("dashboard.drafts")}
        </h2>
        {drafts.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            {t("dashboard.noDrafts")}
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="card-gradient flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm"
              >
                <Pencil className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span className="text-sm font-medium text-slate-700">
                  {DOCUMENT_TITLES[draft.doc_type] ?? draft.doc_type}
                </span>
                <Link
                  href={`${DOCUMENT_EDIT_PATHS[draft.doc_type] ?? "/generate-demand-letter"}?draft=1`}
                  className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  {t("dashboard.drafts")} →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Document history */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {t("dashboard.history")}
          </h2>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label={t("dashboard.allTypes")}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">{t("dashboard.allTypes")}</option>
            {Object.entries(DOCUMENT_TITLES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="card-gradient mt-4 overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">{t("dashboard.date")}</th>
                <th className="px-4 py-3">{t("dashboard.type")}</th>
                <th className="px-4 py-3">{t("dashboard.status")}</th>
                <th className="px-4 py-3">{t("dashboard.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-slate-500">
                    {t("dashboard.empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(doc.created_at).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <span className="flex items-center gap-2">
                        <FileText
                          className="h-4 w-4 text-slate-400"
                          aria-hidden="true"
                        />
                        {DOCUMENT_TITLES[doc.doc_type] ?? doc.doc_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(doc)}
                          disabled={!doc.form_data}
                          className="h-8 gap-1.5 text-xs"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          {t("dashboard.download")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleDelete(doc.id)}
                          className="h-8 gap-1.5 text-xs text-red-600 hover:border-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          {t("dashboard.delete")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-slate-500">
          Only document metadata and form fields are stored — full document
          text is never kept on the server, and documents are re-rendered
          locally when you download.
        </p>
      </section>
    </PageShell>
  );
}
