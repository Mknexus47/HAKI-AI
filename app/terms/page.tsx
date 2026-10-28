import { redirect } from "next/navigation";

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Terms of Use",
  "Terms of use for the HAKI AI legal information platform.",
  "/terms"
);

export default function TermsPage() {
  redirect("/terms-of-service");
}
