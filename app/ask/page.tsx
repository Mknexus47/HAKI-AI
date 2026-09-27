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

interface Message {
  role: "user" | "assistant";
  text: string;
  offerHelp?: boolean;
}

const cannedAnswers: { match: RegExp; answer: string }[] = [
  {
    match: /tenant|landlord|deposit|rent/i,
    answer:
      "In Kenya, a tenant has the right to safe and habitable accommodation, peaceful enjoyment of the property, and protection from unlawful eviction. Your landlord must follow the tenancy agreement and due process before ending a tenancy, and must return your deposit less any agreed deductions. First, review your tenancy agreement. Second, raise the issue with your landlord in writing. Third, if unresolved, send a formal demand letter or contact the Rent Restriction Tribunal. HAKI AI provides general legal information only and does not provide legal advice.",
  },
  {
    match: /dismiss|fired|employment|salary|employer/i,
    answer:
      "Under the Employment Act, an employee is entitled to a fair reason and a fair procedure before dismissal, and to notice or pay in lieu of notice. Keep your contract, payslips, and any related messages. Raise a formal grievance in writing first; if unresolved, send a complaint letter to your employer and consider reporting to the Ministry of Labour. HAKI AI provides general legal information only and does not provide legal advice.",
  },
  {
    match: /refund|faulty|consumer|goods|shop/i,
    answer:
      "Consumers in Kenya are entitled to goods and services that are safe, of acceptable quality, and as described. For faulty goods you may be entitled to repair, replacement, or refund. Keep your receipt, contact the seller in writing stating the remedy you want, and send a formal refund request letter if there is no response. HAKI AI provides general legal information only and does not provide legal advice.",
  },
  {
    match: /demand letter|owed|debt|owe|money/i,
    answer:
      "A demand letter should clearly state the amount owed, the reason, the original due date, the action you require, and a deadline (commonly 7 days). Gather your agreement and payment records first, then send the demand letter and keep proof of delivery. If the deadline passes, consult a licensed advocate about next steps. HAKI AI provides general legal information only and does not provide legal advice.",
  },
  {
    match: /agreement|contract|business|service/i,
    answer:
      "A simple business service agreement should include both parties, the scope of work, price, payment schedule, timeline, and a dispute resolution clause. Both parties should review and sign, and each keep a copy. HAKI AI provides general legal information only and does not provide legal advice.",
  },
];

const highRisk =
  /court|criminal|charge|theft|assault|murder|violence|divorce|land case|inheritance|will/i;

const defaultAnswer =
  "Thank you for your question. HAKI AI answers using curated Kenyan legal information in plain English. Try asking about tenant and landlord rights, employment basics, consumer rights, debt recovery, or business agreements. For serious matters, please consult a licensed advocate of the High Court of Kenya. HAKI AI provides general legal information only and does not provide legal advice.";

function getAnswer(question: string): Message {
  if (highRisk.test(question)) {
    return {
      role: "assistant",
      text: "This matter may require urgent professional legal assistance. Please contact a licensed advocate or a legal aid organisation listed in our directory. HAKI AI provides general legal information only and does not provide legal advice.",
      offerHelp: true,
    };
  }
  const found = cannedAnswers.find((entry) => entry.match.test(question));
  return {
    role: "assistant",
    text: found ? found.answer : defaultAnswer,
  };
}

export default function AskPage() {
  const { t } = useLanguage();
  const online = useOnlineStatus();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [greeting, setGreeting] = React.useState("");

  React.useEffect(() => {
    const welcome = `${t("ask.greeting")}\n\n${t("scope.limitation")}`;
    setMessages([{ role: "assistant", text: welcome }]);
    setGreeting(welcome);
  }, [t]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || sending || !online) return;
    setSending(true);
    setInput("");

    const moderation = await moderateQuestion(question);

    if (moderation.action === "ban") {
      setMessages((current) => [
        ...current,
        { role: "user", text: question },
        { role: "assistant", text: t("moderation.banned") },
      ]);
      setSending(false);
      return;
    }

    if (moderation.action === "flag") {
      setMessages((current) => [
        ...current,
        { role: "user", text: question },
        { role: "assistant", text: t("moderation.paused") },
      ]);
      setSending(false);
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      getAnswer(question),
    ]);
    setSending(false);
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
