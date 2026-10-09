"use client";

import * as React from "react";
import { Download, FileText, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/layout/PageShell";
import Feedback from "@/components/ui/feedback";
import { downloadPdf } from "@/lib/pdf";
import { createClient } from "@/lib/supabase-client";
import {
  DOCUMENT_PDF_TITLES,
  DOCUMENT_TITLES,
  type GenericForm,
} from "@/lib/documents";

export interface GeneratorField {
  key: string;
  label: string;
  type?: "text" | "date" | "number" | "textarea" | "select";
  options?: string[];
  span?: boolean;
  placeholder?: string;
}

interface GeneratorShellProps {
  docType: string;
  title: string;
  intro: string;
  fields: GeneratorField[];
  emptyForm: GenericForm;
  buildParagraphs: (form: GenericForm, today: string) => string[];
  titleForHistory: (form: GenericForm) => string;
}

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring";
const labelClassName = "mb-1.5 block text-sm font-medium text-slate-700";

function PreviewBody({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-700">
      {paragraphs.map((para, index) => {
        if (para === "") return <div key={index} className="h-1" />;
        if (para.startsWith("# ")) {
          return (
            <p key={index} className="font-semibold text-slate-900">
              {para.slice(2)}
            </p>
          );
        }
        return <p key={index}>{para}</p>;
      })}
    </div>
  );
}

export default function GeneratorShell({
  docType,
  title,
  intro,
  fields,
  emptyForm,
  buildParagraphs,
  titleForHistory,
}: GeneratorShellProps) {
  const storageKey = `haki-draft-${docType}`;
  const [form, setForm] = React.useState<GenericForm>(emptyForm);
  const [consent, setConsent] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [draftRestored, setDraftRestored] = React.useState(false);
  const [saveState, setSaveState] = React.useState<"" | "saved">("");
  const [generated, setGenerated] = React.useState(false);
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    const wantsRemote = new URLSearchParams(window.location.search).get(
      "draft"
    );

    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      if (cancelled) return;
      setUserId(uid);
      if (wantsRemote && uid) {
        supabase
          .from("document_requests")
          .select("form_data, consent")
          .eq("doc_type", docType)
          .maybeSingle()
          .then(({ data: remote }) => {
            if (cancelled) return;
            if (remote?.form_data) {
              setForm({
                ...emptyForm,
                ...(remote.form_data as GenericForm),
              });
              setConsent(Boolean(remote.consent));
              setDraftRestored(true);
            }
          });
      }
    });

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          form: GenericForm;
          consent: boolean;
        };
        if (parsed.form) {
          setForm({ ...emptyForm, ...parsed.form });
          setConsent(Boolean(parsed.consent));
          setDraftRestored(true);
        }
      }
    } catch {
      // ignore corrupt drafts
    }

    hydrated.current = true;
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!hydrated.current) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ form, consent, savedAt: Date.now() })
        );
        setSaveState("saved");
      } catch {
        // storage full/blocked — ignore
      }
      if (consent && userId) {
        const supabase = createClient();
        void supabase.from("document_requests").upsert(
          {
            user_id: userId,
            doc_type: docType,
            form_data: form,
            consent: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,doc_type" }
        );
      }
    }, 1200);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, consent, userId]);

  const update =
    (key: string) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setGenerated(false);
      setForm((current) => ({ ...current, [key]: event.target.value }));
    };

  const today = new Date().toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const paragraphs = buildParagraphs(form, today);

  const handleGenerate = async () => {
    downloadPdf(`haki-ai-${docType}.pdf`, paragraphs, {
      title: DOCUMENT_PDF_TITLES[docType] ?? DOCUMENT_TITLES[docType] ?? title,
    });
    setGenerated(true);
    if (userId) {
      try {
        const supabase = createClient();
        await supabase.from("documents").insert({
          user_id: userId,
          doc_type: docType,
          title: titleForHistory(form),
          status: "Generated",
          form_data: form,
        });
      } catch {
        // history logging must never block the download
      }
    }
  };

  const handleClearDraft = () => {
    window.localStorage.removeItem(storageKey);
    setForm(emptyForm);
    setConsent(false);
    setDraftRestored(false);
    setSaveState("");
  };

  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        {intro}
      </p>

      {draftRestored ? (
        <div className="mt-4 flex max-w-3xl items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="flex items-center gap-2">
            <Save className="h-4 w-4" aria-hidden="true" />
            Draft restored — pick up where you left off.
          </span>
          <button
            type="button"
            onClick={handleClearDraft}
            className="flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-emerald-900"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Start fresh
          </button>
        </div>
      ) : null}

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="card-gradient rounded-xl border p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">
            Guided form
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.key}
                className={field.span ? "sm:col-span-2" : undefined}
              >
                <label htmlFor={field.key} className={labelClassName}>
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    id={field.key}
                    value={form[field.key] ?? ""}
                    onChange={update(field.key)}
                    className={inputClassName}
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={field.key}
                    value={form[field.key] ?? ""}
                    onChange={update(field.key)}
                    rows={3}
                    placeholder={field.placeholder}
                    className={inputClassName}
                  />
                ) : (
                  <input
                    id={field.key}
                    type={field.type ?? "text"}
                    value={form[field.key] ?? ""}
                    onChange={update(field.key)}
                    placeholder={field.placeholder}
                    min={field.type === "number" ? 1 : undefined}
                    className={inputClassName}
                  />
                )}
              </div>
            ))}
          </div>

          <label className="mt-6 flex items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1 accent-[#e5342b]"
            />
            <span>
              Save my draft securely?
              {!userId ? (
                <span className="block text-xs text-slate-500">
                  Saved on this device — log in to sync across devices.
                </span>
              ) : null}
            </span>
          </label>
          <p className="mt-2 min-h-[16px] text-xs font-medium text-emerald-700">
            {saveState === "saved" ? "Draft saved." : ""}
          </p>

          <div className="mt-4">
            <Button
              onClick={handleGenerate}
              className="btn-gradient-primary h-[52px] w-full rounded-full px-8 text-[15px] font-semibold"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download PDF
            </Button>
            {generated ? (
              <div className="mt-4">
                <p className="text-xs font-medium text-emerald-700">
                  Document generated and added to your history.
                </p>
                <Feedback context="document" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-500">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Live preview
          </p>
          <PreviewBody paragraphs={paragraphs} />
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-slate-500">
        This document is generated from a fixed HAKI AI template
        (template-based filling only). HAKI AI provides general legal
        information only — it does not provide legal advice or create a
        lawyer-client relationship.
      </p>
    </PageShell>
  );
}
