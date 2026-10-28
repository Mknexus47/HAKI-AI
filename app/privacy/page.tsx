import { redirect } from "next/navigation";

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Privacy",
  "How HAKI AI handles your data and protects your privacy.",
  "/privacy"
);

export default function PrivacyPage() {
  redirect("/privacy-policy");
}
