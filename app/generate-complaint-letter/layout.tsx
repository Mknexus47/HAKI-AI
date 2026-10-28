import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Complaint Letter Generator",
  "Write a consumer complaint letter citing the Consumer Protection Act for Kenyan consumers.",
  "/generate-complaint-letter"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}