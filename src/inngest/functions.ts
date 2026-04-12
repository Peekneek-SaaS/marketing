import { firecrawl } from "@/lib/firecrawl";
import { inngest } from "./client";
import prisma from "@/lib/prisma";


export const scrapeUrl = inngest.createFunction(
  { id: "scrape-url", triggers: [{ event: "scrape/url" }] },
  async ({ event, step }) => {
    const scrape = step.sleep("scrape", 1000);
  },
);
