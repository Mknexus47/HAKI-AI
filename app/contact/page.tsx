"use client";

import * as React from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/layout/PageShell";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring";
const labelClassName = "mb-1.5 block text-sm font-medium text-slate-700";

export default function ContactPage() {
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [needsActivation, setNeedsActivation] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNeedsActivation(false);
    setSending(true);

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/michaelkariuki281@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            _subject: `HAKI AI contact — ${form.name}`,
            name: form.name,
            email: form.email,
            message: form.message,
          }),
        }
      );

      const data: { success?: boolean | string; message?: string } | null =
        await response.json().catch(() => null);
      setSending(false);

      if (!response.ok || !data?.success) {
        setError(
          "We could not send your message. Please email michaelkariuki281@gmail.com directly."
        );
        return;
      }

      const message = String(data.message ?? "").toLowerCase();
      if (message.includes("confirm") || message.includes("activate")) {
        setNeedsActivation(true);
      }

      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch {
      setSending(false);
      setError(
        "We could not send your message. Please email michaelkariuki281@gmail.com directly."
      );
    }
  };

  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
        Contact Support
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
        Questions about HAKI AI, your documents, or this platform? Send us a
        message and we will get back to you.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card-gradient rounded-xl border p-8 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">
              Send a message
            </h2>
            {error ? (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </p>
            ) : null}
            {sent ? (
              <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {needsActivation ? (
                  <>
                    One more step: we sent a confirmation email to
                    michaelkariuki281@gmail.com. Open it and click the activation
                    link — your message will be delivered from then on.
                  </>
                ) : (
                  <>
                    Thank you — your message has been sent. Our support team
                    will respond by email.
                  </>
                )}
              </p>
            ) : null}
            <form onSubmit={handleSubmit} className="mt-4 space-y-5">
              <div>
                <label htmlFor="contact-name" className={labelClassName}>
                  Your name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className={inputClassName}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className={labelClassName}>
                  Email address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  className={inputClassName}
                />
              </div>
              <div>
                <label htmlFor="contact-message" className={labelClassName}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  value={form.message}
                  onChange={(event) =>
                    setForm({ ...form, message: event.target.value })
                  }
                  className={inputClassName}
                />
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="btn-gradient-primary h-[48px] rounded-full px-8 text-[15px] font-semibold"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {sending ? "Sending..." : "Send message"}
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-gradient rounded-xl border p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Direct details
            </h2>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                michaelkariuki281@gmail.com
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                +254 712 345 678
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                Nairobi, Kenya
              </li>
            </ul>
          </div>

          <div className="card-gradient rounded-xl border p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              Support hours
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Email support is monitored Monday to Friday, 8:00 AM – 5:00 PM
              EAT. The platform itself is available 24/7.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
