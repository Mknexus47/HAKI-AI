import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Completing Sign In",
  "HAKI AI sign-in callback. Redirects you back to the app after authentication.",
  "/auth/callback",
  { noindex: true }
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
