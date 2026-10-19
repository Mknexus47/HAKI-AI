"use client";

import * as React from "react";
import { FileScan, Loader2, ScanText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/layout/PageShell";
import { useLanguage } from "@/components/language-provider";
import { useOnlineStatus } from "@/components/offline-support";
import { extractTextFromImage, type OcrProgress } from "@/lib/ocr";
import { analyseClauses, type ClauseFinding } from "@/lib/clause-analysis";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring";

const OCR_STATUS_LABELS: Record<string, string> = {
  "loading tesseract core": "Loading OCR engine…",
  "initializing tesseract": "Initialising OCR…",
  "loading language traineddata": "Loading language data…",
  "initializing api": "Preparing text recognition…",
  "recognizing text": "Reading your document…",
};

export default function ContractAnalysisPage() {
  const { t, lang } = useLanguage();
  const online = useOnlineStatus();
  const [file, setFile] = React.useState<File | null>(null);
  const [text, setText] = React.useState("");
  const [progress, setProgress] = React.useState<OcrProgress | null>(null);
  const [running, setRunning] = React.useState(false);
  const [analysed, setAnalysed] = React.useState<ClauseFinding[] | null>(null);
  const [error, setError] = React.useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setText("");
    setAnalysed(null);
    setError("");
  };

  const handleExtract = async () => {
    if (!file || running) return;
    setRunning(true);
    setError("");
    setAnalysed(null);
    setProgress({ status: "starting", progress: 0 });
    try {
      const extracted = await extractTextFromImage(file, setProgress);
      setText(extracted);
      if (!extracted.trim()) {
        setError(
          lang === "sw"
            ? "Hakuna maandishi yaliyopatikana. Jaribu picha safi zaidi au wazi zaidi."
            : "No text was found. Try a clearer, brighter photo of the document."
        );
      }
    } catch (err) {
      const detail = err instanceof Error && err.message ? err.message : null;
      const fallback =
        lang === "sw"
          ? "Kuchanganua maandishi kumeshindwa. Hakikisha una muunganisho wa mtandao na jaribu tena."
          : "Text extraction failed. Check your internet connection and try again.";
      setError(detail ? `${detail}` : fallback);
    } finally {
      setRunning(false);
      setProgress(null);
    }
  };

  const handleAnalyse = () => {
    setAnalysed(analyseClauses(text));
  };

  const busy = running;

  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        {lang === "sw"
          ? "Changanua Mkataba au Hati ya Kisheria"
          : "Scan a Contract or Legal Document"}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        {lang === "sw"
          ? "Pakia picha au picha ya mkataba, barua, au risiti. Maandami huchanganuliwa kivinjari kwenye kifaa chako — hakipakiwi kwenye seva za HAKI AI — kisha hati zinazohitaji umakini zinaonyeshwa kwa lugha rahisi."
          : "Upload a photo or scan of an agreement, letter, or receipt. Text is extracted in your browser on your own device — it is never uploaded to HAKI AI servers — and clauses that may need attention are then highlighted in plain language."}
      </p>

      {!online ? (
        <div className="mt-6 max-w-3xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {lang === "sw"
            ? "Kuchanganua maandishi kuhitaji muunganisho wa mtandao. Unganisha na jaribu tena."
            : "Text extraction needs an internet connection. Reconnect and try again."}
        </div>
      ) : null}

      <div className="card-gradient mt-8 max-w-3xl rounded-xl border p-6 shadow-sm">
        <label
          htmlFor="scan-file"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          {lang === "sw" ? "Chagua picha ya hati" : "Choose an image of the document"}
        </label>
        <input
          id="scan-file"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/bmp"
          onChange={handleFileChange}
          disabled={busy}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-5 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700 disabled:opacity-60"
        />
        {file ? (
          <p className="mt-2 text-xs text-slate-500">
            {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
          </p>
        ) : null}

        <Button
          onClick={handleExtract}
          disabled={!file || busy || !online}
          className="btn-gradient-primary mt-4 h-[52px] w-full rounded-full px-8 text-[15px] font-semibold sm:w-auto"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ScanText className="h-4 w-4" aria-hidden="true" />
          )}
          {busy
            ? lang === "sw"
              ? "Inachanganua…"
              : "Extracting text…"
            : lang === "sw"
              ? "Changanua maandishi"
              : "Extract text"}
        </Button>

        {progress ? (
          <div className="mt-4">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress.progress * 100)}
              className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
            >
              <div
                className="h-2 rounded-full bg-[#e5342b] transition-all"
                style={{ width: `${Math.round(progress.progress * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              {OCR_STATUS_LABELS[progress.status] ??
                (lang === "sw" ? "Inafanya kazi…" : "Working…")}
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}
      </div>

      {text ? (
        <div className="mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileScan className="h-4 w-4" aria-hidden="true" />
            {lang === "sw" ? "Maandishi yaliyopatikana" : "Extracted text"}
          </p>
          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setAnalysed(null);
            }}
            rows={10}
            aria-label={lang === "sw" ? "Maandishi yaliyopatikana" : "Extracted text"}
            className={inputClassName}
          />
          <p className="mt-2 text-xs text-slate-500">
            {lang === "sw"
              ? "Tayarisha maandishi hapo juu kwa kuyaingiza kwa mkono kama OCR imekosea, kisha chambua."
              : "OCR can make mistakes — edit the text above to correct it, then analyse."}
          </p>
          <Button
            onClick={handleAnalyse}
            variant="outline"
            className="mt-4 h-[48px] w-full rounded-full px-8 text-[15px] font-semibold sm:w-auto"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {lang === "sw" ? "Chambua vifungu" : "Analyse clauses"}
          </Button>
        </div>
      ) : null}

      {analysed ? (
        <div className="mt-8 max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">
            {lang === "sw" ? "Vifungu vinavyohitaji umakini" : "Clauses that may need attention"}
          </p>
          {analysed.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              {lang === "sw"
                ? "Hakuna vifungu vilivyopatikana kutoka kwa sheria hii. Hakikisha maandishi ni kamili."
                : "No matching clauses were found in this text. Check that the extracted text is complete."}
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {analysed.map((finding) => (
                <li
                  key={finding.rule.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {finding.rule.title[lang]}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {finding.rule.note[lang]}
                  </p>
                  <p className="mt-2 rounded bg-white px-3 py-2 text-xs italic leading-relaxed text-slate-500">
                    “{finding.excerpt}”
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 text-xs leading-relaxed text-slate-500">
            {lang === "sw"
              ? "Tahadhari: hii ni taarifa ya jumla tu ya kuelimisha. Hakuna uchambuzi hapa unaohojiwa na advocate na hauchukui nafasi ya ushauri wa kitaalamu wa kisheria. Kwa mkataba muhimu, mtume kwa Advocate wa Mahakama Kuu ya Kenya."
              : "Warning: this is general informational guidance only. None of the notes above has been reviewed by an advocate, and this tool does not replace professional legal review. For an important agreement, send it to a licensed Advocate of the High Court of Kenya."}
          </p>
        </div>
      ) : null}
    </PageShell>
  );
}
