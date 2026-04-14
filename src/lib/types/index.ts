export type CrawlMode =
  | "exact"
  | "path"
  | "domain"
  | "subdomain"
  | "domain-subdomains";

export type CrawlStatus = "pending" | "running" | "done" | "failed";

export type Plan = "free" | "pro" | "business";

export const PLAN_LIMITS: Record<
  Plan,
  {
    crawlsPerDay: number;
    maxPages: number;
    savedWebsites: number;
    modes: CrawlMode[];
    checkExternal: boolean;
    followRedirects: boolean;
    autoCrawl: boolean;
    frequency: string[];
  }
> = {
  free: {
    crawlsPerDay: 1,
    maxPages: 1,
    savedWebsites: 0,
    modes: ["exact"],
    checkExternal: false,
    followRedirects: false,
    autoCrawl: false,
    frequency: [],
  },
  pro: {
    crawlsPerDay: Infinity,
    maxPages: 500,
    savedWebsites: 5,
    modes: ["exact", "path", "domain"],
    checkExternal: true,
    followRedirects: true,
    autoCrawl: true,
    frequency: ["weekly"],
  },
  business: {
    crawlsPerDay: Infinity,
    maxPages: Infinity,
    savedWebsites: Infinity,
    modes: ["exact", "path", "domain", "subdomain", "domain-subdomains"],
    checkExternal: true,
    followRedirects: true,
    autoCrawl: true,
    frequency: ["weekly", "daily"],
  },
};
