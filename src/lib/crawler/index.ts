import { extractLinks } from "./extract-links";
import { checkLink } from "./check-link";
import { shouldCrawl, shouldCheck, isExternalUrl, normalizeUrl } from "./utils";
import { CrawlMode } from "@/lib/types";

export type CrawlLinkResult = {
  url: string;
  parentUrl: string | null;
  status: number | null;
  redirectedTo: string | null;
  responseTime: number;
  error: string | null;
  isBroken: boolean;
  isRedirect: boolean;
  isExternal: boolean;
};

export type CrawlOptions = {
  url: string;
  mode: CrawlMode;
  checkExternal: boolean;
  followRedirects: boolean;
  maxPages: number;
};

// Called every time a link is checked
// Use this to save to DB in real time
export type OnLinkChecked = (result: CrawlLinkResult) => Promise<void>;

export async function crawl(
  options: CrawlOptions,
  onLinkChecked: OnLinkChecked,
): Promise<void> {
  const { url, mode, checkExternal, followRedirects, maxPages } = options;

  const startUrl = normalizeUrl(url);

  // Track visited and queued URLs
  const visited = new Set<string>();
  const queued = new Set<string>();

  // Queue stores url + its parent
  const queue: Array<{ url: string; parentUrl: string | null }> = [
    { url: startUrl, parentUrl: null },
  ];
  queued.add(startUrl);

  while (queue.length > 0) {
    // Enforce max pages limit
    if (visited.size >= maxPages) break;

    const { url: currentUrl, parentUrl } = queue.shift()!;

    // Skip if already visited
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    // Check this link
    const checkResult = await checkLink(currentUrl, followRedirects);
    const isExternal = isExternalUrl(currentUrl, startUrl);

    // Report result immediately (saved to DB in real time)
    await onLinkChecked({
      url: currentUrl,
      parentUrl,
      status: checkResult.status,
      redirectedTo: checkResult.redirectedTo,
      responseTime: checkResult.responseTime,
      error: checkResult.error,
      isBroken: checkResult.isBroken,
      isRedirect: checkResult.isRedirect,
      isExternal,
    });

    // Don't crawl broken pages, external links,
    // or pages outside crawl scope
    if (checkResult.isBroken) continue;
    if (isExternal) continue;
    if (!shouldCrawl(currentUrl, startUrl, mode)) continue;

    // Fetch full HTML to extract links
    try {
      const response = await fetch(currentUrl, {
        signal: AbortSignal.timeout(10000),
        headers: {
          "User-Agent": "LinkCheck/1.0",
        },
      });

      // Only parse HTML pages
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) continue;

      const html = await response.text();
      const links = extractLinks(html, currentUrl);

      // Add new links to queue
      for (const link of links) {
        const normalized = normalizeUrl(link);

        // Skip already visited or queued
        if (visited.has(normalized)) continue;
        if (queued.has(normalized)) continue;

        // Only queue if we should check it
        if (!shouldCheck(normalized, startUrl, mode, checkExternal)) {
          continue;
        }

        queue.push({ url: normalized, parentUrl: currentUrl });
        queued.add(normalized);
      }
    } catch {
      // Failed to fetch/parse — skip
      continue;
    }

    // Polite delay between requests
    // Avoids hammering the target server
    await new Promise((r) => setTimeout(r, 200));
  }
}
