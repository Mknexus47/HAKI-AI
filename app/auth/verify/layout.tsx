import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Verify Your Email",
  "Confirm your email address to activate your HAKI AI account.",
  "/auth/verify",
  { noindex: true }
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
