export type LinkCheckResult = {
  url: string;
  status: number | null;
  redirectedTo: string | null;
  responseTime: number;
  error: string | null;
  isBroken: boolean;
  isRedirect: boolean;
};

export async function checkLink(
  url: string,
  followRedirects: boolean = true,
): Promise<LinkCheckResult> {
  const start = Date.now();

  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: followRedirects ? "follow" : "manual",
      signal: AbortSignal.timeout(10000), // 10 second timeout
      headers: {
        "User-Agent": "LinkCheck/1.0 (Dead Link Checker - linkcheck.app)",
      },
    });

    const responseTime = Date.now() - start;
    const status = response.status;
    const isRedirect = [301, 302, 303, 307, 308].includes(status);
    const isBroken = status >= 400;

    return {
      url,
      status,
      redirectedTo: response.redirected ? response.url : null,
      responseTime,
      error: null,
      isBroken,
      isRedirect,
    };
  } catch (error) {
    const responseTime = Date.now() - start;

    // Identify specific error types
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        errorMessage = "timeout";
      } else if (error.message.includes("fetch")) {
        errorMessage = "network error";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      url,
      status: null,
      redirectedTo: null,
      responseTime,
      error: errorMessage,
      isBroken: true, // treat errors as broken
      isRedirect: false,
    };
  }
}
