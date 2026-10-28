import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/dashboard", "/admin", "/login", "/signup", "/offline"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
