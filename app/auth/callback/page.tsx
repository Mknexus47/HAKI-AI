"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck, AlertCircle } from "lucide-react";
import PageShell from "@/components/layout/PageShell";
import { createClient } from "@/lib/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const hasRun = React.useRef(false);

  React.useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const supabase = createClient();

    const finish = async () => {
      const url = new URL(window.location.href);

      if (url.searchParams.get("error")) {
        router.replace(`/auth/verify?${url.searchParams.toString()}`);
        return;
      }

      const tokenHash = url.searchParams.get("token_hash");
      if (tokenHash) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          type: "signup",
          token_hash: tokenHash,
        });
        if (otpError) {
          setError(
            `Could not confirm your email (${otpError.message}). Please sign up again to get a new link.`
          );
          return;
        }
        router.replace("/");
        router.refresh();
        return;
      }

      const code = url.searchParams.get("code");

      if (code) {
        // The client auto-exchanges `?code=` during initialization
        // (GoTrueClient._getSessionFromURL). Manually calling
        // exchangeCodeForSession here would run after that and fail because
        // the verifier was already consumed — so we just wait for init.
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          setError(
            "Google sign-in could not be completed. Please go back and try again."
          );
          return;
        }

        const user = sessionData.session.user;
        if (user && !user.email_confirmed_at) {
          if (user.email) {
            await supabase.auth.resend({
              type: "signup",
              email: user.email,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            });
          }
          router.replace(
            `/auth/verify?email=${encodeURIComponent(user.email ?? "")}`
          );
          return;
        }

        router.replace("/");
        router.refresh();
        return;
      }

      if (window.location.hash.includes("access_token")) {
        router.replace("/");
        router.refresh();
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/");
        router.refresh();
        return;
      }

      setError(
        "This confirmation link is invalid or has expired. Please sign up again to get a new link."
      );
    };

    finish();
  }, [router]);

  return (
    <PageShell>
      <div className="mx-auto max-w-md text-center">
        {error ? (
          <>
            <span className="icon-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              Confirmation failed
            </h1>
            <p className="mt-3 text-slate-600">{error}</p>
            <Link
              href="/signup"
              className="btn-gradient-primary mt-6 inline-flex h-[48px] items-center rounded-full px-8 text-[15px] font-semibold"
            >
              Sign up again
            </Link>
          </>
        ) : (
          <>
            <span className="icon-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm">
              <MailCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              Confirming your email…
            </h1>
            <p className="mt-3 text-slate-600">
              Please wait while we activate your account.
            </p>
          </>
        )}
      </div>
    </PageShell>
  );
}
