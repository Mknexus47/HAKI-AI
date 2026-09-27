"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { GoogleIcon } from "@/components/ui/google-icon";
import { Button } from "@/components/ui/button";
import PageShell from "@/components/layout/PageShell";
import { createClient } from "@/lib/supabase-client";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring";
const labelClassName = "mb-1.5 block text-sm font-medium text-slate-700";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
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
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Invalid email or password. Please check your details and try again."
          : signInError.message
      );
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold text-slate-900">Login</h1>
        <p className="mt-3 text-slate-600">
          Sign in to save your documents and chat history.
        </p>

        <div className="card-gradient mt-8 rounded-xl border p-8 shadow-sm">
          {error ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          <form className="space-y-5" onSubmit={handleSubmit}>
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
                className={inputClassName}
              />
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
                className={inputClassName}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="btn-gradient-primary h-[48px] w-full rounded-full px-8 text-[15px] font-semibold"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-slate-900 underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </p>
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
          No account yet?{" "}
          <Link
            href="/signup"
            className="font-medium text-slate-900 underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
