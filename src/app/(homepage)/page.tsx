import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton } from "@clerk/nextjs";
import { SearchIcon } from "lucide-react";
import TextArea from "./components/textarea";
import Features from "./components/features";
import Link from "next/link";

export default function Page() {
  return (
    <main className="py-24 flex flex-col items-center px-4">
      <div className="flex flex-col gap-8 items-center justify-center">
        {/* <Link
          href="#"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs text-primary border hover:bg-secondary"
        >
          <SearchIcon className="size-3.5" />
          Advertisement
        </Link> */}
        <div className="flex flex-col gap-4 items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center max-w-2xl leading-tight">
            Find{" "}
            <span className="bg-rose-500 px-1.5 py-1 rounded-lg line-through text-white dark:text-black">
              broken links
            </span>{" "}
            before your visitors do
          </h1>

          <p className="text-muted-foreground text-center max-w-lg text-base">
            Crawl your website and visualize every link as an interactive tree.
            Instantly spot dead links, redirects, and errors.
          </p>
        </div>
        <TextArea />
        <Features />
      </div>
    </main>
  );
}
