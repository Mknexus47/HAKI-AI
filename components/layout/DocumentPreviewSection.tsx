"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatAmount(value: string) {
  const digits = value.replace(/[^0-9.]/g, "");
  if (!digits) return "0";
  const number = Number(digits);
  return Number.isNaN(number) ? "0" : number.toLocaleString("en-KE");
}

export default function DocumentPreviewSection() {
  const [sender, setSender] = React.useState("John Kamau");
  const [recipient, setRecipient] = React.useState("Jane Wanjiku");
  const [amount, setAmount] = React.useState("15000");
  const [reason, setReason] = React.useState(
    "unpaid consultancy services rendered in August 2026"
  );
  const [dueDate, setDueDate] = React.useState("1 September 2026");

  return (
    <section
      id="generator"
      aria-labelledby="generator-heading"
      className="py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            id="generator-heading"
            className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl"
          >
            Document Generator Preview
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-600">
            Fill in a few guided fields and watch your demand letter take shape
            before you download it as a PDF.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left: simplified form */}
          <div className="card-gradient rounded-xl border p-8 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-slate-900">
              Demand letter form
            </h3>
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="sender-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Your full name
                </label>
                <input
                  id="sender-name"
                  type="text"
                  value={sender}
                  onChange={(event) => setSender(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="recipient-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Recipient name
                </label>
                <input
                  id="recipient-name"
                  type="text"
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="amount-owed"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Enter Amount Owed (KES)
                </label>
                <input
                  id="amount-owed"
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="reason-owed"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Reason for the debt
                </label>
                <input
                  id="reason-owed"
                  type="text"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="e.g. unpaid services rendered"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label
                  htmlFor="due-date-preview"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Date money was due
                </label>
                <input
                  id="due-date-preview"
                  type="text"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  placeholder="e.g. 1 September 2026"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Right: live preview */}
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-slate-500">
              Live preview
            </p>
            <div className="space-y-4 text-sm leading-relaxed text-slate-700">
              <p className="text-center text-base font-semibold text-slate-900">
                DEMAND LETTER
              </p>
              <p className="text-slate-500">
                {new Date().toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p>
                Dear{" "}
                {recipient ? (
                  recipient
                ) : (
                  <span className="italic text-slate-400">
                    [Recipient Name]
                  </span>
                )}
                ,
              </p>
              <p>
                I,{" "}
                {sender ? (
                  <strong>{sender}</strong>
                ) : (
                  <span className="italic text-slate-400">[Your Name]</span>
                )}
                , formally demand the sum of{" "}
                <strong>KES {formatAmount(amount)}</strong> owed to me as
                outstanding payment for{" "}
                {reason ? (
                  reason
                ) : (
                  <span className="italic text-slate-400">
                    unpaid consultancy services rendered in August 2026
                  </span>
                )}
                .
              </p>
              <p>
                Payment was due on{" "}
                {dueDate ? (
                  dueDate
                ) : (
                  <span className="italic text-slate-400">
                    1 September 2026
                  </span>
                )}
                . Kindly remit the full amount within 7 days of receiving
                this letter, or provide a written explanation of the delay.
              </p>
              <p>
                Should the matter remain unresolved, I reserve the right to
                pursue further recovery measures available under Kenyan law.
              </p>
              <p className="pt-2">
                Yours faithfully,
                <br />
                {sender ? (
                  <strong>{sender}</strong>
                ) : (
                  <span className="italic text-slate-400">[Your Name]</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            asChild
            className="btn-gradient-primary h-[56px] rounded-full px-9 text-[17px] font-semibold"
          >
            <Link href="/generate-demand-letter">
              Try the Demand Letter Generator
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
