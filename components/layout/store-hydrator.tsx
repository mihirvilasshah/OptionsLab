"use client";

import * as React from "react";
import { useProgressStore } from "@/store/progress";
import { useSimulatorStore } from "@/store/simulator";

export function StoreHydrator() {
  React.useEffect(() => {
    void useProgressStore.persist.rehydrate();
    void useSimulatorStore.persist.rehydrate();
  }, []);
  return null;
}

export function useHydrated() {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  return hydrated;
}
