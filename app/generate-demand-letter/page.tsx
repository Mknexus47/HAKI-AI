"use client";

import * as React from "react";
import { Download, FileText, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/layout/PageShell";
import Feedback from "@/components/ui/feedback";
import { downloadPdf } from "@/lib/pdf";
import { createClient } from "@/lib/supabase-client";
import {
  demandLetterParagraphs,
  DEMAND_LETTER_DOC_TYPE,
  type DemandLetterForm,
} from "@/lib/documents";

const issueTypes = [
  "Unpaid rent deposit",
  "Unpaid services rendered",
  "Unpaid loan",
  "Undelivered goods",
  "Refund not processed",
  "Other",
];

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring";
const labelClassName = "mb-1.5 block text-sm font-medium text-slate-700";

const emptyForm: DemandLetterForm = {
  sender: "",
  phone: "",
  recipient: "",
  issue: issueTypes[0],
  amount: "",
  dueDate: "",
  action: "Full payment of the amount owed",
  deadline: "7",
};

const STORAGE_KEY = "haki-draft-demand-letter";

export default function GenerateDemandLetterPage() {
  const [form, setForm] = React.useState<DemandLetterForm>(emptyForm);
  const [consent, setConsent] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [draftRestored, setDraftRestored] = React.useState(false);
  const [saveState, setSaveState] = React.useState<"" | "saved">("");
  const [generated, setGenerated] = React.useState(false);
  const hydrated = React.useRef(false);

  // Hydrate: restore draft from localStorage, or from Supabase when
  // the dashboard's "Continue Draft" link carries ?draft=1.
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
          .eq("doc_type", DEMAND_LETTER_DOC_TYPE)
          .maybeSingle()
          .then(({ data: remote }) => {
            if (cancelled) return;
            if (remote?.form_data) {
              setForm({
                ...emptyForm,
                ...(remote.form_data as DemandLetterForm),
              });
              setConsent(Boolean(remote.consent));
              setDraftRestored(true);
            }
          });
      }
    });

    let localDraft: DemandLetterForm | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          form: DemandLetterForm;
          consent: boolean;
        };
        localDraft = parsed.form;
        setConsent(Boolean(parsed.consent));
      }
    } catch {
      // ignore corrupt drafts
    }

    if (localDraft) {
      setForm({ ...emptyForm, ...localDraft });
      setDraftRestored(true);
    }

    hydrated.current = true;
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced auto-save (1.2s after the last keystroke).
  React.useEffect(() => {
    if (!hydrated.current) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
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
            doc_type: DEMAND_LETTER_DOC_TYPE,
            form_data: form,
            consent: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,doc_type" }
        );
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [form, consent, userId]);

  const update = (key: keyof DemandLetterForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setGenerated(false);
      setForm((current) => ({ ...current, [key]: event.target.value }));
    };

  const today = new Date().toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const paragraphs = demandLetterParagraphs(form, today);

  const handleGenerate = async () => {
    downloadPdf("haki-ai-demand-letter.pdf", paragraphs, {
      title: "DEMAND LETTER",
    });
    setGenerated(true);
    if (userId) {
      try {
        const supabase = createClient();
        await supabase.from("documents").insert({
          user_id: userId,
          doc_type: DEMAND_LETTER_DOC_TYPE,
          title: `Demand letter — ${form.issue} — KES ${form.amount || "—"}`,
          status: "Generated",
          form_data: form,
        });
      } catch {
        // history logging must never block the download
      }
    }
  };

  const handleClearDraft = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setForm(emptyForm);
    setConsent(false);
    setDraftRestored(false);
    setSaveState("");
  };

  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        Demand Letter Generator
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        Complete the guided form below. Your document is generated from a
        fixed template — no raw AI drafting — and downloads as a PDF.
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
        {/* Guided form */}
        <div className="card-gradient rounded-xl border p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">
            Guided form
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="sender" className={labelClassName}>
                Your full name
              </label>
              <input
                id="sender"
                type="text"
                value={form.sender}
                onChange={update("sender")}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClassName}>
                Your phone number
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={update("phone")}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="recipient" className={labelClassName}>
                Recipient name
              </label>
              <input
                id="recipient"
                type="text"
                value={form.recipient}
                onChange={update("recipient")}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="issue" className={labelClassName}>
                Issue type
              </label>
              <select
                id="issue"
                value={form.issue}
                onChange={update("issue")}
                className={inputClassName}
              >
                {issueTypes.map((issue) => (
                  <option key={issue} value={issue}>
                    {issue}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className={labelClassName}>
                Amount owed (KES)
              </label>
              <input
                id="amount"
                type="text"
                inputMode="numeric"
                value={form.amount}
                onChange={update("amount")}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="due-date" className={labelClassName}>
                Date money was due
              </label>
              <input
                id="due-date"
                type="date"
                value={form.dueDate}
                onChange={update("dueDate")}
                className={inputClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="action" className={labelClassName}>
                Action required
              </label>
              <input
                id="action"
                type="text"
                value={form.action}
                onChange={update("action")}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="deadline" className={labelClassName}>
                Deadline (days)
              </label>
              <input
                id="deadline"
                type="number"
                min={1}
                value={form.deadline}
                onChange={update("deadline")}
                className={inputClassName}
              />
            </div>
          </div>

          {/* Save & Resume consent */}
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

        {/* Live preview */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-500">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Live preview
          </p>
          <div className="space-y-3 text-sm leading-relaxed text-slate-700">
            <p className="text-center text-base font-semibold text-slate-900">
              DEMAND LETTER
            </p>
            <p className="text-slate-500">{today}</p>
            <p>
              Dear{" "}
              {form.recipient || (
                <span className="italic text-slate-400">
                  [Recipient Name]
                </span>
              )}
              ,
            </p>
            <p className="font-semibold">
              RE: DEMAND FOR PAYMENT — {form.issue.toUpperCase()}
            </p>
            <p>
              I,{" "}
              {form.sender ? (
                <strong>{form.sender}</strong>
              ) : (
                <span className="italic text-slate-400">[Your Name]</span>
              )}{" "}
              (telephone:{" "}
              {form.phone || (
                <span className="italic text-slate-400">[phone]</span>
              )}
              ), formally demand the sum of{" "}
              {form.amount ? (
                <strong>KES {form.amount}</strong>
              ) : (
                <span className="italic text-slate-400">[Amount]</span>
              )}{" "}
              owed to me in respect of {form.issue.toLowerCase()}.
            </p>
            <p>
              {form.dueDate ? (
                `Payment was due on ${form.dueDate}.`
              ) : (
                <span className="italic text-slate-400">
                  Payment was due on 1 September 2026 (sample date — enter the
                  actual due date).
                </span>
              )}
            </p>
            <p>The action required of you is: {form.action}.</p>
            <p>
              Please comply within {form.deadline || "7"} days of receiving
              this letter.
            </p>
            <p>
              If the matter remains unresolved within the stated deadline, I
              reserve the right to pursue further recovery measures available
              under Kenyan law.
            </p>
            <p className="pt-2">
              Yours faithfully,
              <br />
              {form.sender ? (
                <strong>{form.sender}</strong>
              ) : (
                <span className="italic text-slate-400">[Your Name]</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-slate-500">
        This document is generated from a fixed HAKI AI template (template-based
        filling only). HAKI AI provides general legal information only — it
        does not provide legal advice or create a lawyer-client relationship.
      </p>
    </PageShell>
  );
}
