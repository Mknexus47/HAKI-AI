import { redirect } from "next/navigation";

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Legal Documents",
  "Browse the legal document templates available on HAKI AI for Kenyan use.",
  "/documents"
);

export default function DocumentsIndexPage() {
  redirect("/document-generator");
}
