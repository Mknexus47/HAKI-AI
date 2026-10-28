import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Contact HAKI AI",
  "Get in touch with the HAKI AI team for support, feedback, or questions.",
  "/contact"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}