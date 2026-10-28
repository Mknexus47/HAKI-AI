import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Ask a Legal Question",
  "Ask simple legal questions and get plain-language answers based on curated Kenyan legal information, in English or Swahili.",
  "/ask"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}