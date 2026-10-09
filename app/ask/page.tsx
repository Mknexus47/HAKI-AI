"use client";

import * as React from "react";
import Link from "next/link";
import { Send, TreeDeciduous } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/layout/PageShell";
import Feedback from "@/components/ui/feedback";
import { useLanguage } from "@/components/language-provider";
import { useOnlineStatus } from "@/components/offline-support";
import { moderateQuestion, isTemporarilyBanned } from "@/lib/moderation";
import { getAnswer, type ChatMessage as Message } from "@/lib/chat";

export default function AskPage() {
  const { t } = useLanguage();
  const online = useOnlineStatus();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [greeting, setGreeting] = React.useState("");
  // Monotonic id so a slow moderation call can never attach its response
  // to a newer question (no stale responses on rapid consecutive sends).
  const requestId = React.useRef(0);

  React.useEffect(() => {
    const welcome = `${t("ask.greeting")}\n\n${t("scope.limitation")}`;
    setMessages([{ role: "assistant", text: welcome }]);
    setGreeting(welcome);
  }, [t]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || sending || !online) return;
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setSending(true);
    setInput("");

    try {
      const moderation = await moderateQuestion(question);
      // A newer send superseded this one — drop the stale result.
      if (requestId.current !== currentRequest) return;

      if (moderation.action === "ban") {
        setMessages((current) => [
          ...current,
          { role: "user", text: question },
          { role: "assistant", text: t("moderation.banned") },
        ]);
        return;
      }

      if (moderation.action === "flag") {
        setMessages((current) => [
          ...current,
          { role: "user", text: question },
          { role: "assistant", text: t("moderation.paused") },
        ]);
        return;
      }

      // The exact latest question is classified fresh — history is display
      // only and never influences the answer, so a previous answer can never
      // leak into the current response.
      const answer = getAnswer(question);
      setMessages((current) => [
        ...current,
        { role: "user", text: question },
        answer,
      ]);
    } catch {
      if (requestId.current !== currentRequest) return;
      setMessages((current) => [
        ...current,
        { role: "user", text: question },
        {
          role: "assistant",
          text: "Sorry — something went wrong while preparing your answer. Please try sending your question again.",
        },
      ]);
    } finally {
      if (requestId.current === currentRequest) setSending(false);
    }
  };

  const offline = !online;

  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        {t("ask.title")}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        {t("ask.intro")}
      </p>

      <div className="card-gradient mt-8 max-w-4xl rounded-xl border p-6 shadow-sm">
        {offline ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {t("ask.offline")}
          </div>
        ) : null}

        <div
          aria-live="polite"
          className="max-h-[480px] space-y-4 overflow-y-auto"
        >
          {messages.map((message, index) =>
            message.role === "user" ? (
              <div
                key={index}
                className="ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-slate-900 px-4 py-3 text-sm leading-relaxed text-white"
              >
                {message.text}
              </div>
            ) : (
              <div key={index} className="max-w-[92%]">
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#e5342b]">
                  <TreeDeciduous className="h-3.5 w-3.5" aria-hidden="true" />
                  HAKI AI
                </p>
                <div className="whitespace-pre-line rounded-lg rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700">
                  {message.text}
                  {message.offerHelp ? (
                    <p className="mt-2">
                      <Link
                        href="/legal-aid"
                        className="font-semibold text-[#c0221b] underline underline-offset-2"
                      >
                        {t("legalAid.getHelp")} →
                      </Link>
                    </p>
                  ) : null}
                </div>
                {message.text !== greeting ? (
                  <Feedback context="chat" />
                ) : null}
              </div>
            )
          )}
          {isTemporarilyBanned() ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {t("moderation.banned")}
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSend} className="mt-6 flex gap-3">
          <label htmlFor="legal-question" className="sr-only">
            {t("ask.title")}
          </label>
          <input
            id="legal-question"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={offline ? t("ask.offline") : t("ask.placeholder")}
            disabled={offline || sending}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-slate-50"
          />
          <Button
            type="submit"
            disabled={offline || sending}
            className="btn-gradient-primary h-10 rounded-full px-5 text-sm font-semibold"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {t("common.send")}
          </Button>
        </form>
      </div>

      <p className="mt-6 max-w-4xl text-sm leading-relaxed text-slate-500">
        {t("ask.disclaimer")}
      </p>
    </PageShell>
  );
}
