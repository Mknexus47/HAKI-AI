import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Rent Acknowledgement Letter Generator",
  "Create a rent payment acknowledgement letter for landlord and tenant records in Kenya.",
  "/generate-rent-acknowledgement"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}