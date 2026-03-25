import ProductPage from "@/features/product/components/product-page";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { useQuery } from "@tanstack/react-query";

async function Page({ params }: { params: Promise<{ pId: string }> }) {
  const productId = await params;

  prefetch(trpc.getProductById.queryOptions(productId.pId));

  return (
    <HydrateClient>
      <ProductPage pId={productId.pId} />
    </HydrateClient>
  );
}

export default Page;
