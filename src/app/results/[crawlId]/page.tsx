"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  skipToken,
} from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTRPC } from "@/trpc/client";
import { CrawlCanvas } from "@/components/canvas/crawl-canvas";
import { CrawlFilters } from "../../../components/dashboard/crawl-filters";
import { useCrawlStore } from "@/components/store/crawl-store";
import { Sidebar } from "@/app/(homepage)/components/header";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";

export default function ResultsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { isSignedIn, userId } = useAuth();
  const params = useParams<{ crawlId: string }>();
  const crawlId = params.crawlId;
  const { filter } = useCrawlStore();
  const [isPolling, setIsPolling] = useState(true);

  const pollMs = isPolling ? 2000 : false;

  const { data: crawl } = useQuery(
    trpc.crawl.status.queryOptions(crawlId ? { crawlId } : skipToken, {
      refetchInterval: pollMs,
    }),
  );

  const claimOrphan = useMutation(
    trpc.crawl.claimIfOrphan.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.crawl.history.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.crawl.status.queryKey({ crawlId: crawlId! }),
        });
      },
    }),
  );

  useEffect(() => {
    if (!crawlId || !isSignedIn || !crawl?.isUnowned) return;
    claimOrphan.mutate({ crawlId });
  }, [crawlId, isSignedIn, crawl?.isUnowned]);

  const { data: links = [] } = useQuery(
    trpc.crawl.results.queryOptions(crawlId ? { crawlId, filter } : skipToken, {
      refetchInterval: pollMs,
    }),
  );

  // Stop polling when crawl is done or failed
  useEffect(() => {
    if (crawl?.status === "done" || crawl?.status === "failed") {
      setIsPolling(false);
    }
  }, [crawl?.status]);

  const isRunning = crawl?.status === "running" || crawl?.status === "pending";

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top bar */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Sidebar userId={userId ?? null} />
          <span className="text-sm font-medium text-foreground truncate max-w-xs">
            {crawl?.url}
          </span>
          {isRunning && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Crawling
            </span>
          )}
          {crawl?.status === "done" && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              Complete
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <CrawlFilters className="hidden md:flex" />
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

      {/* Canvas — takes remaining height */}
      <div className="flex-1">
        <ReactFlowProvider>
          <CrawlCanvas crawl={crawl} links={links} isLoading={isRunning} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
