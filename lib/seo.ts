import type { Metadata } from "next";
import { SITE_URL } from "./site";

const OG_IMAGE = "/logo-icon.jpg";

// Per-page metadata with canonical + social tags. Used by server pages
// directly and by the tiny layout.tsx files of client pages.
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  options?: { noindex?: boolean; priorityType?: "website" | "article" }
): Metadata {
  const fullTitle = `${title} | HAKI AI`;
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path === "/" ? undefined : path },
    robots: options?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: "HAKI AI",
      type: options?.priorityType ?? "website",
      images: [{ url: OG_IMAGE, width: 512, height: 512, alt: "HAKI AI" }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE],
    },
  };
}

// JSON-LD structured data for search results (site name, links, org info).
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "HAKI AI",
        url: SITE_URL,
        description:
          "AI-powered legal information and document generation platform for Kenya.",
        inLanguage: ["en", "sw"],
      },
      {
        "@type": "Organization",
        name: "HAKI AI",
        url: SITE_URL,
        logo: `${SITE_URL}/logo-icon.jpg`,
        sameAs: [],
      },
    ],
  };
}
