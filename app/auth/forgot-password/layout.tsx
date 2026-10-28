import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Forgot Your Password",
  "Request a password reset link for your HAKI AI account.",
  "/auth/forgot-password",
  { noindex: true }
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
