"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { firecrawl } from "@/lib/firecrawl";
import { urlInputSchema } from "@/schema/url-input-schema";

export default function UrlInput() {
  const form = useForm({
    defaultValues: {
      url: "",
    },
    validators: {
      onSubmit: urlInputSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form
      id="url-input-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="url"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="Paste a valid url..."
                autoComplete="off"
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-none h-full w-full"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />
    </form>
  );
}
