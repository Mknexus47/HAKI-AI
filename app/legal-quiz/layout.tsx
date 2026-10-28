import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Legal Knowledge Quiz",
  "Test your knowledge of everyday Kenyan legal rights with a short interactive quiz.",
  "/legal-quiz"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}