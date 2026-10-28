import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Legal Aid Directory",
  "Verified Kenyan legal aid organisations offering free or affordable legal help.",
  "/legal-aid"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}