"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  MailCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/layout/PageShell";
import { createClient } from "@/lib/supabase-client";

type Status = "loading" | "pending" | "verified" | "error";

export default function AuthVerifyPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<Status>("loading");
  const [error, setError] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);
  const [resendState, setResendState] = React.useState<
    null | "sending" | "sent"
  >(null);

  const checkUser = React.useCallback(async (): Promise<Status | "none"> => {
    const supabase = createClient();
    const { data, error: userError } = await supabase.auth.getUser();

    if (userError || !data.user) return "none";

    if (data.user.email_confirmed_at) {
      setEmail(data.user.email ?? null);
      return "verified";
    }
    setEmail(data.user.email ?? null);
    return "pending";
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError =
      params.get("error_description") || params.get("error");
    const emailParam = params.get("email");

    const init = async () => {
      if (oauthError) {
        setError(
          oauthError.replace(/\+/g, " ") === "access_denied"
            ? "Google sign-in was cancelled or failed. Please try again."
            : oauthError.replace(/\+/g, " ")
        );
        setStatus("error");
        return;
      }

      const state = await checkUser();

      if (state === "verified") {
        setStatus("verified");
        return;
      }

      if (state === "pending") {
        setStatus("pending");
        return;
      }

      if (emailParam) {
        setEmail(emailParam);
        setStatus("pending");
        return;
      }

      setError(
        "We could not find a pending account. Please sign up again or log in."
      );
      setStatus("error");
    };

    init();
  }, [checkUser]);

  React.useEffect(() => {
    if (status !== "pending") return;
    const interval = window.setInterval(async () => {
      const state = await checkUser();
      if (state === "verified") setStatus("verified");
    }, 3000);
    return () => window.clearInterval(interval);
  }, [status, checkUser]);

  const handleResend = async () => {
    if (!email) return;
    setResendState("sending");
    const supabase = createClient();
    await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setResendState("sent");
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md text-center">
        <div className="card-gradient rounded-xl border p-8 shadow-sm">
          {status === "loading" ? (
            <>
              <span className="icon-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm">
                <Loader2
                  className="h-6 w-6 animate-spin"
                  aria-hidden="true"
                />
              </span>
              <h1 className="text-2xl font-bold text-slate-900">
                Checking your verification…
              </h1>
              <p className="mt-3 text-slate-600">
                Please wait a moment.
              </p>
            </>
          ) : null}

          {status === "pending" ? (
            <>
              <span className="icon-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm">
                <Mail className="h-6 w-6" aria-hidden="true" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900">
                Verify your email
              </h1>
              <p className="mt-3 text-slate-600">
                We sent a verification link to{" "}
                <strong className="text-slate-900">{email ?? "your email"}</strong>.
                Click it to activate your account — this page updates
                automatically once verified.
              </p>
              {resendState === "sent" ? (
                <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Verification email sent. Check your inbox (and spam folder).
                </p>
              ) : null}
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  onClick={handleResend}
                  disabled={resendState === "sending" || !email}
                  className="btn-gradient-primary h-[48px] rounded-full px-8 text-[15px] font-semibold"
                >
                  <MailCheck className="h-4 w-4" aria-hidden="true" />
                  {resendState === "sending"
                    ? "Sending..."
                    : "Resend verification email"}
                </Button>
                <Link
                  href="/login"
                  className="inline-flex h-[48px] items-center justify-center rounded-full border border-slate-300 px-8 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-white hover:text-slate-900"
                >
                  Back to Login
                </Link>
              </div>
            </>
          ) : null}

          {status === "verified" ? (
            <>
              <span className="icon-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900">
                Email verified
              </h1>
              <p className="mt-3 text-slate-600">
                Your account is active. You can now ask legal questions and
                generate documents.
              </p>
              <Button
                onClick={() => {
                  router.push("/");
                  router.refresh();
                }}
                className="btn-gradient-primary mt-6 h-[48px] rounded-full px-8 text-[15px] font-semibold"
              >
                Continue to Home
              </Button>
            </>
          ) : null}

          {status === "error" ? (
            <>
              <span className="icon-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm">
                <AlertCircle className="h-6 w-6" aria-hidden="true" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900">
                Verification problem
              </h1>
              <p className="mt-3 text-slate-600">{error}</p>
              <div className="mt-6 flex flex-col gap-3">
                {email ? (
                  <Button
                    onClick={handleResend}
                    disabled={resendState === "sending"}
                    className="btn-gradient-primary h-[48px] rounded-full px-8 text-[15px] font-semibold"
                  >
                    <MailCheck className="h-4 w-4" aria-hidden="true" />
                    {resendState === "sending"
                      ? "Sending..."
                      : "Send a new verification email"}
                  </Button>
                ) : null}
                <Link
                  href="/signup"
                  className="inline-flex h-[48px] items-center justify-center rounded-full border border-slate-300 px-8 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-white hover:text-slate-900"
                >
                  Sign up again
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-[48px] items-center justify-center rounded-full border border-slate-300 px-8 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-white hover:text-slate-900"
                >
                  Go to Login
                </Link>
              </div>
            </>
          ) : null}
        </div>

        <p className="mt-6 text-sm leading-relaxed text-slate-500">
          HAKI AI provides general legal information only — it does not provide
          legal advice or create a lawyer-client relationship.
        </p>
      </div>
    </PageShell>
  );
}
