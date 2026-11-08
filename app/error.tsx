"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surface the digest in the browser console for support; avoid noisy logs in production.
    console.error("Options Lab application error", error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-warning/30 bg-warning-soft text-warning">
        <AlertTriangle className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        500 · Position closed unexpectedly
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Something broke on this page.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The rest of the platform is still available. Try the page again, or go back to the curriculum.
        No data was sent anywhere — your progress is stored locally in this browser.
      </p>
      {error.digest ? (
        <p className="mt-3 rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-[10px] text-muted-foreground">
          Error digest: {error.digest}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={reset}>
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline">
            <Home aria-hidden="true" />
            Go home
          </Button>
        </Link>
      </div>
    </div>
  );
}
