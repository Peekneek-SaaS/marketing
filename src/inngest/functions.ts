import { firecrawl } from "@/lib/firecrawl";
import { inngest } from "./client";
import { extractedDataSchema } from "@/schema/url-input-schema";
import prisma from "@/lib/prisma";
import { STATUS } from "@/schema/status";

export const scrapeUrl = inngest.createFunction(
  { id: "scrape-url", triggers: [{ event: "scrape/url" }] },
  async ({ event, step }) => {
    const { userId } = event.data;
    if (!userId) {
      throw new Error("User ID is required");
    }

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

    const product = await prisma.product.update({
      where: { id: event.data.productId, url: event.data.url },
      data: {
        title: data.title ?? "",
        description: data.description ?? null,
        price: data.price ?? "",
        brand: data.brand ?? null,
        category: data.category ?? null,
        features: data.features ?? [],
        benefits: data.benefits ?? [],
        images: data.images ?? [],
        status: STATUS.APPROVED,
      },
    });

    return { productId: product.id };
  },
);
