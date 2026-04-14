import type { CrawlMode } from "@/lib/types";

// ============================================
// Get root domain from hostname
// blog.yoursite.com → yoursite.com
// ============================================
export function getRootDomain(hostname: string): string {
  const parts = hostname.split(".");
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join(".");
}

// ============================================
// Normalize URL
// Remove trailing slash, hash, default ports
// ============================================
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Remove hash — fragments don't affect page content
    parsed.hash = "";

    // Remove trailing slash (except root)
    if (parsed.pathname !== "/") {
      parsed.pathname = parsed.pathname.replace(/\/$/, "");
    }

    // Remove default ports
    if (
      (parsed.protocol === "http:" && parsed.port === "80") ||
      (parsed.protocol === "https:" && parsed.port === "443")
    ) {
      parsed.port = "";
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

// ============================================
// Should we CRAWL this URL?
// (follow it and extract more links from it)
// ============================================
export function shouldCrawl(
  url: string,
  startUrl: string,
  mode: CrawlMode,
): boolean {
  try {
    const start = new URL(startUrl);
    const current = new URL(url);

    // Must be http or https
    if (!["http:", "https:"].includes(current.protocol)) {
      return false;
    }

    switch (mode) {
      case "exact":
        // Only crawl the exact URL entered
        return normalizeUrl(url) === normalizeUrl(startUrl);

      case "path":
        // Same hostname + must start with same path
        // yoursite.com/blog/post-1 ✅
        // yoursite.com/about ❌
        return (
          current.hostname === start.hostname &&
          current.pathname.startsWith(start.pathname)
        );

      case "domain":
        // Any page on the same domain
        // Treat www and non-www as same
        return (
          current.hostname === start.hostname ||
          current.hostname === `www.${start.hostname}` ||
          `www.${current.hostname}` === start.hostname
        );

      case "subdomain":
        // Only this exact subdomain
        return current.hostname === start.hostname;

      //   case "domain-subdomains":
      //     // Same root domain including all subdomains
      //     const startRoot = getRootDomain(start.hostname);
      //     const currentRoot = getRootDomain(current.hostname);
      //     return startRoot === currentRoot;

      default:
        return false;
    }
  } catch {
    return false;
  }
}

// ============================================
// Should we CHECK this URL?
// (ping it to see if it's alive)
// Different from shouldCrawl —
// we check external links but don't crawl them
// ============================================
export function shouldCheck(
  url: string,
  startUrl: string,
  mode: CrawlMode,
  checkExternal: boolean,
): boolean {
  try {
    const current = new URL(url);

    // Skip non http/https
    if (!["http:", "https:"].includes(current.protocol)) {
      return false;
    }

    // Always check internal links
    if (shouldCrawl(url, startUrl, mode)) return true;

    // Check external links only if option enabled
    if (checkExternal) return true;

    return false;
  } catch {
    return false;
  }
}

// ============================================
// Is this URL external?
// ============================================
export function isExternalUrl(url: string, startUrl: string): boolean {
  try {
    const start = new URL(startUrl);
    const current = new URL(url);
    const startRoot = getRootDomain(start.hostname);
    const currentRoot = getRootDomain(current.hostname);
    return startRoot !== currentRoot;
  } catch {
    return false;
  }
}

// ============================================
// Is URL valid?
// ============================================
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}
