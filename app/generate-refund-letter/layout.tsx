import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Refund Request Letter Generator",
  "Request a refund from a seller with a letter grounded in Kenya Consumer Protection Act.",
  "/generate-refund-letter"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}