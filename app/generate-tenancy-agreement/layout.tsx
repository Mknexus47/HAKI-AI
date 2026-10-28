import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Residential Tenancy Agreement Generator",
  "Draft a residential tenancy agreement compliant with general Kenyan landlord-tenant law.",
  "/generate-tenancy-agreement"
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}