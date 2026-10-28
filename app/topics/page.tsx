import { redirect } from "next/navigation";

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Legal Topics",
  "Plain-language guides to everyday legal rights in Kenya: tenancy, employment, consumer protection, debt, business, and complaints.",
  "/topics"
);

export default function TopicsIndexPage() {
  redirect("/legal-topics");
}
