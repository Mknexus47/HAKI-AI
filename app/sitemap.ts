import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  ["", 1.0],
  ["/legal-topics", 0.9],
  ["/topics", 0.9],
  ["/document-generator", 0.9],
  ["/documents", 0.8],
  ["/ask", 0.9],
  ["/contract-analysis", 0.8],
  ["/legal-aid", 0.8],
  ["/legal-sources", 0.8],
  ["/legal-quiz", 0.6],
  ["/about", 0.6],
  ["/features", 0.6],
  ["/blog", 0.6],
  ["/contact", 0.5],
  ["/privacy", 0.3],
  ["/privacy-policy", 0.3],
  ["/terms", 0.3],
  ["/terms-of-service", 0.3],
].map(([path, priority]) => ({
  url: `${SITE_URL}${path}`,
  lastModified: new Date(),
  changeFrequency: "monthly" as const,
  priority: priority as number,
}));

const TOPIC_SLUGS = [
  "tenant",
  "employment",
  "consumer",
  "debt",
  "business",
  "complaints",
  "access-to-justice",
  "reporting-dispute",
];

const GENERATOR_SLUGS = [
  "demand-letter",
  "rent-acknowledgement",
  "service-agreement",
  "loan-acknowledgement",
  "complaint-letter",
  "refund-letter",
  "tenancy-agreement",
  "employment-contract",
  "affidavit",
  "salary-claim",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const topics: MetadataRoute.Sitemap = TOPIC_SLUGS.map((slug) => ({
    url: `${SITE_URL}/topics/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const generators: MetadataRoute.Sitemap = GENERATOR_SLUGS.map((slug) => ({
    url: `${SITE_URL}/generate-${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  return [...STATIC_PAGES, ...topics, ...generators];
}
