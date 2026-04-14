"use client";

import { useCrawlStore } from "@/components/store/crawl-store";
import { cn } from "@/lib/utils";

const filters = [
  { value: "all", label: "All" },
  { value: "broken", label: "❌ Broken" },
  { value: "working", label: "✅ Working" },
  { value: "redirects", label: "↪️ Redirects" },
  { value: "external", label: "🌐 External" },
] as const;

export function CrawlFilters({ className }: { className?: string }) {
  const { filter, setFilter } = useCrawlStore();

  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-gray-100 rounded-lg p-1",
        className,
      )}
    >
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`
            px-3 py-1 rounded-md text-xs font-medium transition-all
            ${
              filter === f.value
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }
          `}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
