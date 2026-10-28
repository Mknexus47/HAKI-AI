import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Demand Letter Generator",
  "Generate a formal demand letter under Kenyan law, grounded in the Law of Contract Act and related provisions.",
  "/generate-demand-letter"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}