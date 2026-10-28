import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Admin",
  "HAKI AI administration area.",
  "/admin",
  { noindex: true }
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
