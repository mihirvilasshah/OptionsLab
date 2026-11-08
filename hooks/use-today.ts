"use client";

import * as React from "react";

/**
 * Current date, available only after the component has mounted.
 *
 * Statically generated pages are rendered on a build server (often UTC) and
 * again in the browser. Any date computed with `new Date()` during render can
 * therefore differ by a calendar day and break hydration. Returning `null`
 * until the effect runs keeps the server render and the first client render
 * identical; callers show a neutral placeholder until a real date exists.
 */
export function useToday() {
  const [today, setToday] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setToday(new Date());
  }, []);

  return today;
}
