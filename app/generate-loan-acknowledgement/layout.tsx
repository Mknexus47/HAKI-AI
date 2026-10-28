import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Loan Acknowledgement Letter Generator",
  "Generate a loan acknowledgement letter recording amounts and repayment terms under Kenyan law.",
  "/generate-loan-acknowledgement"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}