"use client";

import * as React from "react";
import Link from "next/link";
import { MailCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/layout/PageShell";
import { createClient } from "@/lib/supabase-client";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring";
const labelClassName = "mb-1.5 block text-sm font-medium text-slate-700";

export default function ForgotPasswordPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md text-center">
        <span className="icon-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm">
          {sent ? (
            <MailCheck className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Send className="h-6 w-6" aria-hidden="true" />
          )}
        </span>
        <h1 className="text-3xl font-bold text-slate-900">Reset password</h1>
        <p className="mt-3 text-slate-600">
          {sent
            ? "Check your email for a reset link. Open it on this device to choose a new password."
            : "Enter the email address linked to your HAKI AI account and we'll send you a reset link."}
        </p>

        <div className="card-gradient mt-8 rounded-xl border p-8 text-left shadow-sm">
          {error ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm font-medium text-slate-700">
                Check your email for a reset link.
              </p>
              <p className="text-sm text-slate-500">
                Didn&apos;t receive it? Check your spam folder, or request
                another link.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setError(null);
                  }}
                  variant="outline"
                  className="h-[48px] w-full rounded-full border-slate-300 px-8 text-[15px] font-semibold text-slate-700 hover:bg-white hover:text-slate-900"
                >
                  Resend link
                </Button>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
                >
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="forgot-email" className={labelClassName}>
                  Email address
                </label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={inputClassName}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="btn-gradient-primary h-[48px] w-full rounded-full px-8 text-[15px] font-semibold"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-sm text-slate-600">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
