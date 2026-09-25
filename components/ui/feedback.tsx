"use client";

import * as React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/components/language-provider";
import type { TranslationKey } from "@/lib/i18n";

const reasonKeys: TranslationKey[] = [
  "feedback.tooComplex",
  "feedback.inaccurate",
  "feedback.missingSteps",
  "feedback.other",
];

interface FeedbackProps {
  context: "chat" | "document";
}

export default function Feedback({ context }: FeedbackProps) {
  const { t } = useLanguage();
  const [choice, setChoice] = React.useState<null | "up" | "down">(null);
  const [reason, setReason] = React.useState<string | null>(null);
  const [comment, setComment] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const submit = async (helpful: boolean, selectedReason?: string) => {
    setSubmitted(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await supabase.from("feedback").insert({
        user_id: user?.id ?? null,
        context,
        helpful,
        reason: selectedReason ?? null,
        comment: comment.trim() ? comment.trim().slice(0, 500) : null,
      });
    } catch {
      // Feedback must never break the UX — fail silently in MVP.
    }
  };

  if (submitted) {
    return (
      <p className="mt-3 text-xs font-medium text-emerald-700">
        {t("feedback.thanks")}
      </p>
    );
  }

  if (choice === null) {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <span>{t("feedback.title")}</span>
        <button
          type="button"
          aria-label="Yes, helpful"
          onClick={() => {
            setChoice("up");
            void submit(true);
          }}
          className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:border-emerald-300 hover:text-emerald-600"
        >
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="No, not helpful"
          onClick={() => setChoice("down")}
          className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:border-red-300 hover:text-red-600"
        >
          <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (choice === "up") {
    return (
      <p className="mt-3 text-xs font-medium text-emerald-700">
        {t("feedback.thanks")}
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs">
      <p className="mb-2 font-semibold text-slate-700">{t("feedback.title")}</p>
      <div className="flex flex-wrap gap-2">
        {reasonKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setReason(key)}
            className={`rounded-full border px-2.5 py-1 font-medium transition-colors ${
              reason === key
                ? "border-[#e5342b] bg-red-50 text-[#c0221b]"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {t(key)}
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder={t("feedback.privacy")}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="mt-2 flex items-center gap-2">
        <Button
          type="button"
          disabled={!reason}
          onClick={() => void submit(false, reason ?? undefined)}
          className="btn-gradient-primary h-8 rounded-full px-4 text-xs font-semibold"
        >
          {t("feedback.submit")}
        </Button>
        <button
          type="button"
          onClick={() => {
            setChoice(null);
            setReason(null);
            setComment("");
          }}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
