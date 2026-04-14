import * as cheerio from "cheerio";
import { normalizeUrl, isValidUrl } from "./utils";

export function extractLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || !href.trim()) return;

    // Skip non-links
    if (href.startsWith("mailto:")) return;
    if (href.startsWith("tel:")) return;
    if (href.startsWith("javascript:")) return;
    if (href === "#") return;
    if (href.startsWith("#")) return; // anchor links on same page

    try {
      // Convert relative to absolute
      const absoluteUrl = new URL(href, baseUrl).toString();
      const normalized = normalizeUrl(absoluteUrl);

      if (isValidUrl(normalized)) {
        links.add(normalized);
      }
    } catch {
      // Invalid URL, skip
    }
  });

  return [...links];
}
