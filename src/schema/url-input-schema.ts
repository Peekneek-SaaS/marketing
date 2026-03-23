import z from "zod";

export const urlInputSchema = z.object({
  url: z.url("URL is required"),
});

export type UrlInputSchemaType = z.infer<typeof urlInputSchema>;

export const extractedDataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  features: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

export type ExtractedDataSchemaType = z.infer<typeof extractedDataSchema>;
