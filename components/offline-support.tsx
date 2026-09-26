"use client";

import * as React from "react";
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
  }, []);

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
