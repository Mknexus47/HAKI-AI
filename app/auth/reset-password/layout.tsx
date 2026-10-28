import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Set a New Password",
  "Choose a new password for your HAKI AI account.",
  "/auth/reset-password",
  { noindex: true }
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
