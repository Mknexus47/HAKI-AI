"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { WifiOff } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function useOnlineStatus() {
  const [online, setOnline] = React.useState(true);

  React.useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}

export function OfflineSupport() {
  const online = useOnlineStatus();
  const { t } = useLanguage();

  React.useEffect(() => {
    // Disabled for debugging:
    // if ("serviceWorker" in navigator) {
    //   navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    // }

    // Clean up any previously registered service worker and its caches so
    // stale CSS/JS can no longer be served after a deploy.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          registrations.forEach((registration) => registration.unregister())
        )
        .catch(() => undefined);
    }
    if (typeof window !== "undefined" && "caches" in window) {
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("haki-ai"))
              .map((key) => caches.delete(key))
          )
        )
        .catch(() => undefined);
    }
  }, []);

  // Password recovery links sometimes fall back to the Site URL (homepage)
  // when Supabase rejects the redirect target — forward them to the form.
  const router = useRouter();
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isRecovery =
      window.location.pathname === "/" &&
      (params.has("code") ||
        window.location.hash.includes("access_token"));
    if (isRecovery) {
      router.replace("/auth/reset-password");
    }
  }, [router]);

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg"
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      {t("offline.banner")}
    </div>
  );
}
