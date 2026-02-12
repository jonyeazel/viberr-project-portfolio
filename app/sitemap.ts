import type { MetadataRoute } from "next";

const BASE_URL = "https://swift-bear-260.vercel.app";

const projectSlugs = [
  "outbound-email",
  "collectables",
  "compliance",
  "voucher-fulfillment",
  "donation-workflow",
  "time-tracking",
  "lead-intelligence",
  "mental-health",
  "billing-workflow",
  "seed-data",
  "sustainability-review",
  "traffic-tickets",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const projectPages = projectSlugs.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    ...projectPages,
  ];
}
