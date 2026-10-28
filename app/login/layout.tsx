import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Log in to HAKI AI",
  "Sign in to your HAKI AI account to open saved documents, resume drafts, and view your generation history.",
  "/login",
  { noindex: true }
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
