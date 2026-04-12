"use client";

import React, { useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Field, FieldError } from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const crawlModeSchema = z.enum(["exact", "path", "domain", "subdomain"]);
export const checkUrlFormSchema = z.object({
  url: z.url().min(4, "Atleast 4 Characters"),
  crawlMode: crawlModeSchema,
});
export type CheckUrlForm = z.infer<typeof checkUrlFormSchema>;

type crawlModesTypes = "exact" | "domain";

const crawlModeItems = [
  {
    label: "Exact URL",
    value: "exact",
  },
  {
    label: "Path",
    value: "path",
  },
  {
    label: "Domain",
    value: "domain",
  },
  {
    label: "Subdomain",
    value: "subdomain",
  },
];

const TextArea = () => {
  const form = useForm<CheckUrlForm>({
    resolver: zodResolver(checkUrlFormSchema),
    defaultValues: {
      url: "",
      crawlMode: "exact",
    },
  });
  const url = form.watch("url");
  const urlOk = checkUrlFormSchema.shape.url.safeParse(url ?? "").success;
  function onSubmit(data: CheckUrlForm) {
    toast(`${data.url + data.crawlMode}`);
    form.reset();
  }
  return (
    <div className="w-full max-w-xl space-y-4 bg-card border rounded-lg p-2">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="url"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Textarea
                placeholder="https://example.com"
                className="resize-none text-sm border-none shadow-none focus-visible:ring-0 bg-transparent dark:bg-transparent"
                value={field.value}
                onChange={field.onChange}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex justify-between items-center">
          <Controller
            name="crawlMode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="max-w-fit min-w-22 border-none dark:bg-transparent hover:bg-zinc-100 focus-visible:ring-0">
                    <SelectValue placeholder="Select crawl mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Check Mode</SelectLabel>
                      {crawlModeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button type="submit" disabled={!urlOk}>
            <SearchIcon className="size-3" />
            Check
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TextArea;
