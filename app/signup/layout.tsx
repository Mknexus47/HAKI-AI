import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Create a HAKI AI Account",
  "Create a free HAKI AI account to save drafts, generate Kenyan legal documents, and keep a history of your downloads.",
  "/signup",
  { noindex: true }
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
