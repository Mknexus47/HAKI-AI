import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Employment Contract Generator",
  "Generate an employment contract referencing Kenya Employment Act 2007 on leave, hours, and pay.",
  "/generate-employment-contract"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}