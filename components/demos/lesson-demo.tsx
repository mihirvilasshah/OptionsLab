"use client";

import type { DemoKey, LessonSeed } from "@/lib/lessons";
import { StockOwnershipDemo } from "@/components/demos/stock-ownership-demo";
import { LeverageDemo } from "@/components/demos/leverage-demo";
import { ContractBuilderDemo } from "@/components/demos/contract-builder-demo";
import { StrikeLadderDemo } from "@/components/demos/strike-ladder-demo";
import { BuyerSellerDemo } from "@/components/demos/buyer-seller-demo";
import { OptionPayoffDemo } from "@/components/demos/option-payoff-demo";
import { PremiumBreakdownDemo, ThetaDecayDemo } from "@/components/demos/premium-demos";
import { GreeksExplorer } from "@/components/demos/greeks-explorer";
import { IVSimulator } from "@/components/demos/iv-simulator";
import { LifecycleTimeline } from "@/components/demos/lifecycle-timeline";

const DEMOS: Record<DemoKey, (props: LessonSeed) => React.ReactNode> = {
  "stock-ownership": () => <StockOwnershipDemo />,
  leverage: () => <LeverageDemo />,
  "contract-builder": () => <ContractBuilderDemo />,
  "strike-ladder": () => <StrikeLadderDemo />,
  "buyer-seller": () => <BuyerSellerDemo />,
  "option-payoff": ({ demoConfig }) => (
    <OptionPayoffDemo
      initialType={demoConfig?.type ?? "call"}
      initialSide={demoConfig?.side ?? "long"}
      initialSpot={demoConfig?.initialSpot ?? 1000}
      initialStrike={demoConfig?.initialStrike ?? 1000}
      initialPremium={demoConfig?.initialPremium ?? 50}
      currency="INR"
    />
  ),
  "premium-breakdown": () => <PremiumBreakdownDemo />,
  "theta-decay": () => <ThetaDecayDemo />,
  greeks: () => <GreeksExplorer />,
  "iv-simulator": () => <IVSimulator />,
  lifecycle: () => <LifecycleTimeline />,
};

export function LessonDemo({ lesson }: { lesson: LessonSeed }) {
  const render = DEMOS[lesson.demo];
  if (!render) return null;
  return <div className="not-prose">{render(lesson)}</div>;
}
