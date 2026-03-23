import { firecrawl } from "@/lib/firecrawl";
import { inngest } from "./client";
import { extractedDataSchema } from "@/schema/url-input-schema";
import prisma from "@/lib/prisma";

export const scrapeUrl = inngest.createFunction(
  { id: "scrape-url", triggers: [{ event: "scrape/url" }] },
  async ({ event, step }) => {
    const result = await firecrawl.scrape(event.data.url, {
      formats: [
        {
          type: "json",
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              price: { type: "string" },
              brand: { type: "string" },
              category: { type: "string" },
              features: { type: "array", items: { type: "string" } },
              benefits: { type: "array", items: { type: "string" } },
              images: { type: "array", items: { type: "string" } },
            },
          },
        },
      ],
    });

    if (!result.json) {
      throw new Error("Failed to scrape product");
    }

    const { data, success } = extractedDataSchema.safeParse(result.json);
    if (!success) {
      throw new Error("Extracted data did not match schema");
    }

    await prisma.product.update({
      where: { id: event.data.productId },
      data: {
        title: data.title ?? "",
        description: data.description ?? null,
        price: data.price ?? "",
        brand: data.brand ?? null,
        category: data.category ?? null,
        features: data.features ?? [],
        benefits: data.benefits ?? [],
        images: data.images ?? [],
      },
    });

    

    return { productId: event.data.productId };
  },
);
