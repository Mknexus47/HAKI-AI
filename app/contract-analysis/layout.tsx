import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Scan and Analyse a Contract",
  "Scan a contract to highlight key clauses. Analysis runs privately in your browser.",
  "/contract-analysis"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}