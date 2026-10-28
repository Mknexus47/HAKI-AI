"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { GoogleIcon } from "@/components/ui/google-icon";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/layout/PageShell";
import { createClient, isSupabaseConfigured } from "@/lib/supabase-client";
import { buildSignupHref, safeNextPath } from "@/lib/auth-redirect";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring";
const labelClassName = "mb-1.5 block text-sm font-medium text-slate-700";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<"email" | "password">("email");
  const [email, setEmail] = React.useState("");
  const [nextPath, setNextPath] = React.useState("/");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(safeNextPath(params.get("next")));
    const prefilled = params.get("email");
    if (prefilled) {
      setEmail(prefilled);
      setStep("password");
    }
  }, []);

  const signupHref = buildSignupHref(email, nextPath);

  const handleGoogle = async () => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError(
        "Google sign-in is not available right now (login service not configured). Please use email and password."
      );
      return;
    }
    setGoogleLoading(true);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  };

  const handleEmailSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const value = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!value) return;
    setEmail(value);
    setStep("password");
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const password = String(
      new FormData(event.currentTarget).get("password") ?? ""
    );

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "We couldn't sign you in with those details. If you don't have an account yet, create one below."
          : signInError.message
      );
      return;
    }

    router.push(safeNextPath(nextPath));
    router.refresh();
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold text-slate-900">
          {step === "email" ? "Get started" : "Enter your password"}
        </h1>
        <p className="mt-3 text-slate-600">
          {step === "email"
            ? "Enter your email to continue — new here? Create your account next."
            : `Signing in as ${email}`}
        </p>

        <div className="card-gradient mt-8 rounded-xl border p-8 shadow-sm">
          {error ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {step === "email" ? (
            <form className="space-y-5" onSubmit={handleEmailSubmit}>
              <div>
                <label htmlFor="login-email" className={labelClassName}>
                  Email address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClassName}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="btn-gradient-primary h-[48px] w-full rounded-full px-8 text-[15px] font-semibold"
              >
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handlePasswordSubmit}>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <span className="truncate text-sm text-slate-600">{email}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError(null);
                  }}
                  className="shrink-0 text-sm font-medium text-slate-900 underline-offset-4 hover:underline"
                >
                  Change
                </button>
              </div>
              <div>
                <label htmlFor="login-password" className={labelClassName}>
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  autoFocus
                  className={inputClassName}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="btn-gradient-primary h-[48px] w-full rounded-full px-8 text-[15px] font-semibold"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <p className="text-center text-sm text-slate-600">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-slate-900 underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </p>
            </form>
          )}

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              New to HAKI AI?
            </span>
            <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
          </div>

          <Button
            type="button"
            variant="outline"
            asChild
            className="h-[48px] w-full rounded-full border-slate-300 px-8 text-[15px] font-semibold text-slate-700 hover:bg-white hover:text-slate-900"
          >
            <Link href={signupHref}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Create an account
            </Link>
          </Button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              or
            </span>
            <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
          </div>
          <Button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            variant="outline"
            className="h-[48px] w-full rounded-full border-slate-300 px-8 text-[15px] font-semibold text-slate-700 hover:bg-white hover:text-slate-900"
          >
            <GoogleIcon />
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
