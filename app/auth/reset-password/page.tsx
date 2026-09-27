"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/layout/PageShell";
import { createClient } from "@/lib/supabase-client";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring";
const labelClassName = "mb-1.5 block text-sm font-medium text-slate-700";

const LINK_INVALID = "Invalid or expired link.";

function friendlyTokenError(description: string | null): string {
  if (!description) return LINK_INVALID;
  const lower = description.toLowerCase();
  if (lower.includes("expired") || lower.includes("invalid")) {
    return LINK_INVALID;
  }
  return `${description}. Please request a new reset link.`;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [tokenError, setTokenError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const hasRun = React.useRef(false);

  React.useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const supabase = createClient();

    const resolveToken = async () => {
      const params = new URLSearchParams(window.location.search);

      if (params.get("error")) {
        setTokenError(
          friendlyTokenError(params.get("error_description"))
        );
        return;
      }

      const tokenHash = params.get("token_hash");
      if (tokenHash) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        });
        if (otpError) {
          setTokenError(friendlyTokenError(otpError.message));
          return;
        }
        setReady(true);
        return;
      }

      // `?code=` is auto-exchanged during client init, so getSession()
      // waits for that exchange to finish before reporting the session.
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !data.session) {
        setTokenError(LINK_INVALID);
        return;
      }

      setReady(true);
    };

    resolveToken();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setFormError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (updateError) {
      setFormError(updateError.message);
      return;
    }

    setSuccess(true);
    window.setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 2000);
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md text-center">
        <span className="icon-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm">
          {success ? (
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          ) : tokenError ? (
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          ) : (
            <KeyRound className="h-6 w-6" aria-hidden="true" />
          )}
        </span>

        {tokenError ? (
          <>
            <h1 className="text-3xl font-bold text-slate-900">
              Reset link problem
            </h1>
            <p className="mt-3 text-slate-600">{tokenError}</p>
            <Link
              href="/auth/forgot-password"
              className="btn-gradient-primary mt-6 inline-flex h-[48px] items-center rounded-full px-8 text-[15px] font-semibold"
            >
              Request a new link
            </Link>
            <p className="mt-6 text-sm text-slate-600">
              <Link
                href="/login"
                className="font-medium text-slate-900 underline-offset-4 hover:underline"
              >
                Back to login
              </Link>
            </p>
          </>
        ) : success ? (
          <>
            <h1 className="text-3xl font-bold text-slate-900">
              Password updated
            </h1>
            <p className="mt-3 text-slate-600">
              Your password has been changed. Redirecting you to your
              dashboard…
            </p>
            <Link
              href="/dashboard"
              className="btn-gradient-primary mt-6 inline-flex h-[48px] items-center rounded-full px-8 text-[15px] font-semibold"
            >
              Go to dashboard
            </Link>
          </>
        ) : !ready ? (
          <>
            <h1 className="text-3xl font-bold text-slate-900">
              Preparing reset…
            </h1>
            <p className="mt-3 text-slate-600">
              Please wait while we validate your reset link.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-slate-900">
              Choose a new password
            </h1>
            <p className="mt-3 text-slate-600">
              Your new password must be at least 6 characters.
            </p>

            <div className="card-gradient mt-8 rounded-xl border p-8 text-left shadow-sm">
              {formError ? (
                <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {formError}
                </p>
              ) : null}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="reset-password" className={labelClassName}>
                    New password
                  </label>
                  <input
                    id="reset-password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label htmlFor="reset-confirm" className={labelClassName}>
                    Confirm new password
                  </label>
                  <input
                    id="reset-confirm"
                    name="confirm"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className={inputClassName}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-gradient-primary h-[48px] w-full rounded-full px-8 text-[15px] font-semibold"
                >
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                  {loading ? "Updating..." : "Reset password"}
                </Button>
              </form>
            </div>

            <p className="mt-6 text-sm text-slate-600">
              <Link
                href="/login"
                className="font-medium text-slate-900 underline-offset-4 hover:underline"
              >
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </PageShell>
  );
}
