import { WifiOff } from "lucide-react";
import PageShell from "@/components/layout/PageShell";

export default function OfflinePage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-md text-center">
        <span className="icon-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm">
          <WifiOff className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="text-3xl font-bold text-slate-900">You are offline</h1>
        <p className="mt-4 text-slate-600">
          Chat is unavailable offline. You can still open saved documents and
          previously visited legal topics.
        </p>
      </div>
    </PageShell>
  );
}
