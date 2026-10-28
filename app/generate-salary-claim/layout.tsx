import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Salary and Final Pay Claim Generator",
  "Draft a salary or final pay claim grounded in Kenya Employment Act payment and remedies provisions.",
  "/generate-salary-claim"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}