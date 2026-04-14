"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Globe, Menu, Plus, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

function crawlDisplayName(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

const Header = ({ userId }: { userId: string | null }) => {
  return (
    <header className="border-b border-border px-4">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Sidebar userId={userId} />
          <Globe className="size-5 text-foreground" />
          <span className="font-semibold text-foreground text-lg">
            LinkCheck
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Docs
            </a>
          </nav> */}
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <Button variant="outline" size="sm">
                Sign Up
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button size="sm">Sign In</Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;

export const Sidebar = ({ userId }: { userId: string | null }) => {
  const trpc = useTRPC();
  const signedIn = !!userId;

  const { data: crawls = [], isPending } = useQuery(
    trpc.crawl.history.queryOptions(undefined, {
      enabled: signedIn,
    }),
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md text-foreground hover:bg-accent/80 p-1"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col gap-0 p-0">
        <SheetHeader className="px-4 pt-4 pb-2 shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Globe className="size-5 text-foreground" />
            <span className="font-semibold text-foreground text-lg">
              LinkCheck
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4 flex flex-col gap-3 flex-1 min-h-0">
          <Button className="w-full" asChild>
            <Link href="/" className="flex items-center justify-center gap-2">
              <Plus className="size-4" />
              New
            </Link>
          </Button>

          <span className="text-sm font-medium text-muted-foreground">
            Your previous crawls
          </span>
          <ScrollArea className="w-full flex-1 min-h-[200px] max-h-[min(60vh,480px)] pr-3">
            {!signedIn && (
              <p className="text-sm text-muted-foreground">
                Sign in to see your crawl history.
              </p>
            )}
            {signedIn && isPending && (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
            {signedIn && !isPending && crawls.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No crawls linked to your account yet. Crawls started while
                signed out are hidden until you open that results page once
                while signed in — we attach them automatically.
              </p>
            )}
            {signedIn && !isPending && crawls.length > 0 && (
              <div className="flex flex-col gap-2 pb-2">
                {crawls.map((crawl) => {
                  const name = crawlDisplayName(crawl.url);
                  const label = `${name} — ${crawl.workingLinks} — ${crawl.brokenLinks} not working`;
                  return (
                    <Button
                      key={crawl.id}
                      variant="outline"
                      className="h-auto w-full justify-between whitespace-normal py-2 px-3 text-left"
                      asChild
                    >
                      <Link href={`/results/${crawl.id}`}>
                        <span className="text-sm leading-snug">{name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm leading-snug flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            {crawl.workingLinks}
                          </span>
                          <span className="text-sm leading-snug flex items-center gap-2">
                            <XCircle className="w-3 h-3 text-red-500" />
                            {crawl.brokenLinks}
                          </span>
                        </div>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};
