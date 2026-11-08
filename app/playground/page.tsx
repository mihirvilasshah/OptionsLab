import type { Metadata } from "next";
import { Table2 } from "lucide-react";
import { PageHero, Callout, DisclaimerBanner } from "@/components/ui/section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { OptionPayoffDemo } from "@/components/demos/option-payoff-demo";
import { BuyerSellerDemo } from "@/components/demos/buyer-seller-demo";
import { WhatIfLab } from "@/components/demos/what-if-lab";

export const metadata: Metadata = {
  title: "Options Playground — Interactive Payoff Simulator",
  description:
    "Build long and short call or put positions, change spot, strike, premium, time and implied volatility, and inspect payoff curves, expiry tables and P&L surfaces.",
  alternates: { canonical: "/playground" },
};

export default function PlaygroundPage() {
  return (
    <>
      <PageHero
        eyebrow="Playground"
        title={
          <>
            Move an input. <span className="gradient-text">Watch the trade change.</span>
          </>
        }
        description="A hands-on payoff simulator for single-option positions. Every chart and number is a Black–Scholes model estimate, not a live market quote."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Calls & puts</Badge>
          <Badge variant="outline">Buyer vs seller</Badge>
          <Badge variant="outline">What-if repricing</Badge>
          <Badge variant="outline">Expiry tables</Badge>
        </div>
      </PageHero>

      <div className="container-page py-8">
        <Tabs defaultValue="call">
          <div className="overflow-x-auto pb-1">
            <TabsList className="w-max">
              <TabsTrigger value="call">Call buyer</TabsTrigger>
              <TabsTrigger value="put">Put buyer</TabsTrigger>
              <TabsTrigger value="buyer-seller">Buyer vs seller</TabsTrigger>
              <TabsTrigger value="what-if">What-if lab</TabsTrigger>
              <TabsTrigger value="table">
                <Table2 aria-hidden="true" />
                Expiry table
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="call">
            <OptionPayoffDemo
              initialType="call"
              initialSide="long"
              initialSpot={1000}
              initialStrike={1000}
              initialPremium={48}
              initialDays={30}
              initialIv={24}
              initialLots={1}
              initialLotSize={75}
              lockType
              lockSide
              mode="lab"
              title="Long call simulator"
              description="Change the strike, premium, days and IV. The payoff, metrics and expiry table update instantly."
            />
          </TabsContent>

          <TabsContent value="put">
            <OptionPayoffDemo
              initialType="put"
              initialSide="long"
              initialSpot={1000}
              initialStrike={1000}
              initialPremium={44}
              initialDays={30}
              initialIv={24}
              initialLots={1}
              initialLotSize={75}
              lockType
              lockSide
              mode="lab"
              title="Long put simulator"
              description="A put gains intrinsic value below the strike. Above it, the most you can lose is the premium."
            />
          </TabsContent>

          <TabsContent value="buyer-seller">
            <BuyerSellerDemo />
          </TabsContent>

          <TabsContent value="what-if">
            <WhatIfLab />
          </TabsContent>

          <TabsContent value="table">
            <OptionPayoffDemo
              initialType="call"
              initialSide="long"
              initialSpot={1000}
              initialStrike={1000}
              initialPremium={48}
              initialDays={30}
              initialIv={24}
              initialLots={1}
              initialLotSize={75}
              mode="lab"
              title="Expiration table and P&L surface"
              description="The table is open by default here. Toggle the heatmap to see how time and price interact."
            />
            <Callout variant="info" className="mt-4">
              The table assumes the position is held to expiration. The heatmap reprices the option at
              earlier dates with the Black–Scholes model, so it shows mark-to-market P&amp;L — including
              time value — rather than only intrinsic value.
            </Callout>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <DisclaimerBanner />
        </div>
      </div>
    </>
  );
}
