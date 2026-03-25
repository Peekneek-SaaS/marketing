"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import Image from "next/image";
import { STATUS } from "@/schema/status";
import { Spinner } from "@/components/ui/spinner";

interface ProductPageProps {
  pId: string;
}

export default function ProductPage({ pId }: ProductPageProps) {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.getProductById.queryOptions(pId));

  return (
    <div>
      {data?.product.status === STATUS.PENDING ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1>We are fetching your product</h1>
          <p>Please wait for it to be fetched</p>
          <Spinner className="size-10 animate-spin" />
        </div>
      ) : (
        <div>
          <h1>
            Title: {data?.product.title}
            <p>Description: {data?.product.description}</p>
            <p>rice: {data?.product.price}</p>
            {/* {data?.product.images.map((image) => (
          <Image
            src={image}
            alt={data?.product.title}
            width={100}
            height={100}
            className="w-full h-full object-cover"
          />
        ))} */}
            {data?.product.features.map((feature, _index) => (
              <p key={_index}>
                Feature {_index + 1}: {feature}
              </p>
            ))}
          </h1>
        </div>
      )}
    </div>
  );
}
