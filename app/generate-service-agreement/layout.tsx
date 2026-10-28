import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Business Service Agreement Generator",
  "Draft a business service agreement between two parties under Kenyan law.",
  "/generate-service-agreement"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}