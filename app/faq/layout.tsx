import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Frequently Asked Questions",
  "Answers about HAKI AI — free legal information, document generation, privacy, and languages for Kenya.",
  "/faq"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
