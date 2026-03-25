"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useState } from "react";
import UrlInput from "./url-input";
import { FileIcon, LinkIcon, PencilIcon, SendIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import Router, { useRouter } from "next/navigation";
import { toast } from "sonner";

enum DashboardViewInputType {
  URL = "url",
  MANUAL = "manual",
  CSV = "csv",
}

export default function DashboardViewInput() {
  const router = useRouter();
  const trpc = useTRPC();

  const [inputType, setInputType] = useState<DashboardViewInputType>(
    DashboardViewInputType.URL,
  );
  const scrapeUrl = useMutation(
    trpc.scrapeUrl.mutationOptions({
      onSuccess: (data) => {
        toast.success("Scraping job queued...");
        router.push(`/p/${data.productId}`);
      },
      onError: (error) => {
        toast.error("Failed to scrape product");
      },
    }),
  );

  return (
    <div className="flex flex-col justify-center items-center min-h-0 px-2 flex-1">
      <h1 className="text-xl py-4">
        {inputType === DashboardViewInputType.URL
          ? "Paste a valid URL..."
          : inputType === DashboardViewInputType.MANUAL
            ? "Enter product details manually"
            : "Upload a CSV file"}
      </h1>
      <Card className="w-full max-w-md">
        <CardContent>
          {inputType === DashboardViewInputType.URL && (
            <UrlInput
              onSubmitUrl={(url) => {
                scrapeUrl.mutate({ url });
              }}
            />
          )}
        </CardContent>
        <CardFooter className="bg-transparent border-t-0 pt-0">
          <div className="flex justify-between w-full">
            <Select
              value={inputType}
              onValueChange={(value) =>
                setInputType(value as DashboardViewInputType)
              }
            >
              <SelectTrigger>
                <SelectValue defaultValue={DashboardViewInputType.URL} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    value={DashboardViewInputType.URL}
                    className={cn(
                      inputType === DashboardViewInputType.URL &&
                        "bg-secondary text-secondary-foreground",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <LinkIcon className="size-3" />
                      URL
                    </span>
                  </SelectItem>
                  <SelectItem
                    value={DashboardViewInputType.MANUAL}
                    className={cn(
                      inputType === DashboardViewInputType.MANUAL &&
                        "bg-secondary text-secondary-foreground",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <PencilIcon className="size-3" />
                      Manual
                    </span>
                  </SelectItem>
                  <SelectItem
                    value={DashboardViewInputType.CSV}
                    className={cn(
                      inputType === DashboardViewInputType.CSV &&
                        "bg-secondary text-secondary-foreground",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <FileIcon className="size-3" />
                      CSV
                    </span>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              type="submit"
              form={
                inputType === DashboardViewInputType.URL
                  ? "url-input-form"
                  : inputType === DashboardViewInputType.MANUAL
                    ? "manual-input-form"
                    : "csv-input-form"
              }
              disabled={scrapeUrl.isPending}
            >
              <SendIcon className="size-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      <p className="text-[10px] text-muted-foreground py-3">
        <span className="font-bold">Note:</span> The input will be processed and
        displayed in the dashboard view.
      </p>
    </div>
  );
}
