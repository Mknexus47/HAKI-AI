"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { GoogleIcon } from "@/components/ui/google-icon";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/layout/PageShell";
import { createClient } from "@/lib/supabase-client";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring";
const labelClassName = "mb-1.5 block text-sm font-medium text-slate-700";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGoogle = async () => {
    setError(null);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signUpError) {
      if (/already (registered|exists)/i.test(signUpError.message)) {
        setError(
          "An account with this email already exists. Please log in instead."
        );
      } else {
        setError(signUpError.message);
      }
      return;
    }

    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      setError(
        "An account with this email already exists. Please log in instead."
      );
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setNotice(
      "Account created. Check your email to confirm your address, then log in."
    );
    router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold text-slate-900">Sign Up</h1>
        <p className="mt-3 text-slate-600">
          Create an account to save generated documents and keep your chat
          history.
        </p>

        <div className="card-gradient mt-8 rounded-xl border p-8 shadow-sm">
          {error ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {notice}
            </p>
          ) : null}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="signup-name" className={labelClassName}>
                Full name
              </label>
              <input
                id="signup-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="signup-email" className={labelClassName}>
                Email address
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="signup-password" className={labelClassName}>
                Password
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClassName}
              />
            </div>
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input type="checkbox" required className="mt-1 accent-[#e5342b]" />
              I understand HAKI AI provides general legal information only and
              is not a substitute for a licensed advocate.
            </label>
            <Button
              type="submit"
              disabled={loading}
              className="btn-gradient-primary h-[48px] w-full rounded-full px-8 text-[15px] font-semibold"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
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

        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
