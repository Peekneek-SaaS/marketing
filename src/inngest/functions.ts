import { firecrawl } from "@/lib/firecrawl";
import { inngest } from "./client";
import prisma from "@/lib/prisma";
import { crawl } from "@/lib/crawler";
import type { CrawlMode } from "@/lib/types";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const crawlWebsite = inngest.createFunction(
  {
    id: "crawl-website",
    name: "Crawl Website",
    // timeout: "1h",
    retries: 2,
    concurrency: {
      limit: 10, // max 10 crawls running at once
    },
    triggers: [{ event: "crawl/start" }],
  },
  // { id: "scrape-url", triggers: [{ event: "scrape/url" }] },
  async ({ event, step }) => {
    const {
      crawlId,
      url,
      mode,
      checkExternal,
      followRedirects,
      maxPages,
      userId,
    } = event.data;

    await step.run("mark-running", async () => {
      await prisma.crawl.update({
        where: { id: crawlId },
        data: {
          status: "running",
          startedAt: new Date(),
        },
      });
    });

    const startTime = Date.now();

    await step.run("crawl", async () => {
      try {
        await crawl(
          {
            url,
            mode: mode as CrawlMode,
            checkExternal,
            followRedirects,
            maxPages,
          },
          // Called every time a link is checked
          // Saves to prisma immediately → frontend sees it in real time
          async (result) => {
            await prisma.link.create({
              data: {
                crawlId,
                url: result.url,
                parentUrl: result.parentUrl,
                status: result.status,
                redirectedTo: result.redirectedTo,
                responseTime: result.responseTime,
                error: result.error,
                isBroken: result.isBroken,
                isRedirect: result.isRedirect,
                isExternal: result.isExternal,
              },
            });

            // Update running counts on crawl record
            await prisma.crawl.update({
              where: { id: crawlId },
              data: {
                totalLinks: { increment: 1 },
                brokenLinks: result.isBroken ? { increment: 1 } : undefined,
                workingLinks:
                  !result.isBroken && !result.isRedirect
                    ? { increment: 1 }
                    : undefined,
                redirectLinks: result.isRedirect ? { increment: 1 } : undefined,
                externalLinks: result.isExternal ? { increment: 1 } : undefined,
              },
            });
          },
        );
      } catch (error) {
        // Mark as failed if crawler throws
        await prisma.crawl.update({
          where: { id: crawlId },
          data: { status: "failed" },
        });
        throw error;
      }
    });
    await step.run("mark-done", async () => {
      const durationMs = Date.now() - startTime;

      await prisma.crawl.update({
        where: { id: crawlId },
        data: {
          status: "done",
          finishedAt: new Date(),
          durationMs,
        },
      });
    });

    // Step 4 — Send email report if user is logged in
    if (userId) {
      await step.sendEvent("send-report", {
        name: "crawl/completed",
        data: { crawlId, userId },
      });
    }

    return { crawlId, status: "done" };
  },
);

export const sendCrawlReport = inngest.createFunction(
  {
    id: "send-crawl-report",
    name: "Send Crawl Report Email",
    triggers: [{ event: "crawl/completed" }],
  },
  async ({ event, step }) => {
    const { crawlId, userId } = event.data;

    // Get crawl + user details
    const crawl = await step.run("get-crawl", async () => {
      return prisma.crawl.findUnique({
        where: { id: crawlId },
        include: {
          links: {
            where: { isBroken: true },
            take: 10, // top 10 broken links in email
          },
        },
      });
    });

    const user = await step.run("get-user", async () => {
      return prisma.user.findUnique({ where: { id: userId } });
    });

    if (!crawl || !user) return;

    // Only send email if there are broken links
    if (crawl.brokenLinks === 0) return;

    // Send email via Resend
    await step.run("send-email", async () => {
      await resend.emails.send({
        from: "LinkCheck <reports@linkcheck.app>",
        to: user.email,
        subject: `⚠️ ${crawl.brokenLinks} broken links found on ${new URL(crawl.url).hostname}`,
        html: `
          <h2>Crawl Complete</h2>
          <p>We crawled <strong>${crawl.url}</strong> and found:</p>
          <ul>
            <li>✅ ${crawl.workingLinks} working links</li>
            <li>❌ ${crawl.brokenLinks} broken links</li>
            <li>↪️ ${crawl.redirectLinks} redirects</li>
          </ul>
          <h3>Top Broken Links:</h3>
          <ul>
            ${crawl.links
              .map(
                (l) => `
              <li>
                <strong>${l.url}</strong><br/>
                Status: ${l.status || l.error}<br/>
                Found on: ${l.parentUrl || "root"}
              </li>
            `,
              )
              .join("")}
          </ul>
          <a href="https://linkcheck.app/results/${crawlId}">
            View Full Report →
          </a>
        `,
      });
    });
  },
);

export const scheduleAutoCrawl = inngest.createFunction(
  {
    id: "schedule-auto-crawl",
    name: "Schedule Auto Crawls",
    triggers: { cron: "TZ=Europe/Paris 0 12 * * 5" },
  },
  // Runs every day at 8am

  async ({ step }) => {
    const now = new Date();

    // Find all active schedules due to run
    const schedules = await step.run("get-schedules", async () => {
      return prisma.autoCrawl.findMany({
        where: {
          isActive: true,
          nextRunAt: { lte: now },
        },
        // include: {
        //   // Get website details
        // },
      });
    });

    // Trigger a crawl for each schedule
    await step.run("trigger-crawls", async () => {
      for (const schedule of schedules) {
        // Create crawl record
        const crawl = await prisma.crawl.create({
          data: {
            url: schedule.websiteId,
            mode: schedule.mode,
            checkExternal: schedule.checkExternal,
            followRedirects: schedule.followRedirects,
            maxPages: 500,
            status: "pending",
            userId: schedule.userId,
            websiteId: schedule.websiteId,
          },
        });

        // Send to Inngest
        await inngest.send({
          name: "crawl/start",
          data: {
            crawlId: crawl.id,
            url: crawl.url,
            mode: schedule.mode,
            checkExternal: schedule.checkExternal,
            followRedirects: schedule.followRedirects,
            maxPages: 500,
            userId: schedule.userId,
          },
        });

        // Update next run time
        const nextRun = new Date();
        if (schedule.frequency === "daily") {
          nextRun.setDate(nextRun.getDate() + 1);
        } else {
          nextRun.setDate(nextRun.getDate() + 7);
        }

        await prisma.autoCrawl.update({
          where: { id: schedule.id },
          data: {
            lastRunAt: now,
            nextRunAt: nextRun,
          },
        });
      }
    });

    return { triggered: schedules.length };
  },
);
