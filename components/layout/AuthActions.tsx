"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase-client";
import { useLanguage } from "@/components/language-provider";

interface AuthActionsProps {
  stacked?: boolean;
}

export default function AuthActions({ stacked = false }: AuthActionsProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const containerClassName = stacked
    ? "flex w-full flex-col gap-3"
    : "flex items-center gap-3";
  const buttonClassName = stacked ? "w-full" : "";

  if (email) {
    return (
      <div className={containerClassName}>
        <Link
          href="/dashboard"
          title={t("dashboard.title")}
          className={
            stacked
              ? "max-w-full truncate text-center text-sm font-medium text-slate-700 hover:text-[#c0221b]"
              : "hidden max-w-[180px] truncate text-sm font-medium text-slate-700 hover:text-[#c0221b] lg:inline"
          }
        >
          {email}
        </Link>
        <Button
          variant="secondary"
          onClick={handleSignOut}
          className={buttonClassName}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {t("auth.signout")}
        </Button>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <Button
        asChild
        variant="secondary"
        className={buttonClassName}
      >
        <Link href="/login">{t("auth.login")}</Link>
      </Button>
      <Button asChild className={`btn-gradient-primary ${buttonClassName}`}>
        <Link href="/signup">{t("auth.signup")}</Link>
      </Button>
    </div>
  );
}
