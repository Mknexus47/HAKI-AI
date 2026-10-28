import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Affidavit Generator",
  "Create an affidavit draft referencing the Oaths and Commissioners for Oaths Act for use in Kenya.",
  "/generate-affidavit"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}