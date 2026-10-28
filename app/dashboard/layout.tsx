import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "My Dashboard",
  "View and manage your saved HAKI AI documents, drafts, and generation history in one place.",
  "/dashboard",
  { noindex: true }
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
