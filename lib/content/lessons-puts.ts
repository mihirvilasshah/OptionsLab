import type { LessonSeed } from "@/lib/lessons";

export const putLessons: LessonSeed[] = [
  {
    slug: "buying-puts",
    title: "Buying a put option",
    summary: "Profit from falling prices — or buy insurance for a portfolio you already own.",
    minutes: 10,
    demo: "option-payoff",
    demoConfig: { type: "put", side: "long", initialSpot: 1000, initialStrike: 1000, initialPremium: 40 },
    visual: "payoff-put",
    simple: [
      "A put buyer pays a premium for the right to sell the underlying at the strike. The put gains value as the underlying falls below the strike.",
      "Maximum loss is the premium. Maximum profit is capped because the underlying cannot fall below zero; the theoretical maximum is strike − premium per unit.",
      "Puts are used for two different jobs: speculation on a decline, and protection for a long portfolio. The same contract can be either, depending on what else you own.",
    ],
    analogy:
      "A put is home insurance. You pay a premium every period. If the house is fine, you lose the premium but sleep well. If disaster strikes, the policy pays off. Unlike insurance, a put can also be sold for a profit before expiry if volatility spikes.",
    example: {
      intro:
        "Spot is ₹1,000. Buy a ₹1,000-strike put for ₹40. One unit is shown; multiply by lot size for a real contract.",
      rows: [
        { label: "Premium paid", value: "₹40" },
        { label: "Break-even at expiry", value: "₹960 (strike − premium)" },
        { label: "Maximum loss", value: "₹40 (premium)", tone: "bear" },
        { label: "Maximum profit", value: "₹960 (if underlying → 0)", tone: "bull" },
        { label: "Spot at expiry ₹1,100", value: "−₹40", tone: "bear" },
        { label: "Spot at expiry ₹960", value: "₹0" },
        { label: "Spot at expiry ₹900", value: "+₹60", tone: "bull" },
        { label: "Spot at expiry ₹800", value: "+₹160", tone: "bull" },
      ],
      conclusion:
        "The put pays more as the underlying falls. If you own the stock, that payoff offsets your losses — insurance. If you do not own it, the put is a bearish bet with a defined cost.",
    },
    mistakes: [
      "Buying puts repeatedly as 'cheap insurance' without measuring the total premium drag.",
      "Assuming a put profits from a small decline. The premium creates a hurdle below the strike.",
      "Ignoring implied volatility. Puts often get expensive when fear is already high.",
    ],
    takeaways: [
      "Long put: bearish or protective, limited risk, capped but large upside.",
      "Break-even = strike − premium at expiry.",
      "Puts are insurance when paired with stock and speculation when standalone.",
    ],
    quiz: [
      {
        id: "put-buy-q1",
        question: "You buy a ₹800-strike put for ₹25. What is the break-even at expiry?",
        options: ["₹825", "₹800", "₹775", "₹750"],
        correct: 2,
        explanation:
          "For a put buyer, break-even = strike − premium = 800 − 25 = ₹775. Below that price the put is profitable at expiry.",
        difficulty: "Beginner",
        category: "Puts",
      },
      {
        id: "put-buy-q2",
        question: "The maximum profit on a long put is:",
        options: [
          "Unlimited",
          "The premium paid",
          "Strike minus premium per unit (if the underlying falls to zero)",
          "The strike price",
        ],
        correct: 2,
        explanation:
          "The underlying cannot go below zero. Maximum intrinsic value is the strike, so net maximum profit is strike − premium per unit.",
        difficulty: "Beginner",
        category: "Puts",
      },
    ],
  },
  {
    slug: "selling-puts",
    title: "Selling a put option",
    summary: "Get paid to agree to buy lower — the strategy behind cash-secured puts.",
    minutes: 10,
    demo: "option-payoff",
    demoConfig: { type: "put", side: "short", initialSpot: 1000, initialStrike: 1000, initialPremium: 40 },
    visual: "payoff-put",
    simple: [
      "A put seller receives the premium and accepts the obligation to buy the underlying at the strike if assigned. The seller profits if the underlying stays above the strike and the put expires worthless.",
      "Break-even is strike − premium. Maximum profit is the premium. Maximum loss is strike − premium per unit, which occurs if the underlying falls to zero. A cash-secured put has the cash set aside to buy the shares; a naked put uses margin and can be far riskier.",
      "Selling puts is not a free income machine. You are being paid to take on downside risk. In a crash, the premium is small compared with the loss.",
    ],
    analogy:
      "A shopkeeper offers to buy your bicycle at ₹1,000 next month and charges you a ₹40 commitment fee. If the bicycle is worth more, you keep it and the fee. If it crashes to ₹600, you must still buy at ₹1,000 — the fee does not cover the loss.",
    example: {
      intro:
        "Spot is ₹1,000. Sell a ₹1,000-strike put for ₹40. One unit is shown; multiply by lot size for a real contract.",
      rows: [
        { label: "Premium received", value: "+₹40", tone: "bull" },
        { label: "Break-even at expiry", value: "₹960" },
        { label: "Maximum profit", value: "₹40 (premium)", tone: "bull" },
        { label: "Maximum loss", value: "₹960 (if underlying → 0)", tone: "bear" },
        { label: "Spot at expiry ₹1,100", value: "+₹40", tone: "bull" },
        { label: "Spot at expiry ₹1,000", value: "+₹40", tone: "bull" },
        { label: "Spot at expiry ₹900", value: "−₹60", tone: "bear" },
        { label: "Spot at expiry ₹700", value: "−₹260", tone: "bear" },
      ],
      conclusion:
        "The seller keeps ₹40 in flat, rising or mildly falling markets. Below ₹960, losses grow one-for-one. Cash-secured puts cap the risk by setting aside the purchase cost; naked puts can trigger margin calls.",
    },
    mistakes: [
      "Selling puts on a stock you would not want to own at the strike.",
      "Treating premium collected as profit before the position is closed.",
      "Ignoring the margin and assignment mechanics of physically settled stock options.",
    ],
    takeaways: [
      "Short put: neutral-to-bullish, capped profit, large downside risk.",
      "Break-even = strike − premium.",
      "A cash-secured put is a disciplined way to accept assignment; a naked put is a leveraged short-volatility bet.",
    ],
    quiz: [
      {
        id: "put-sell-q1",
        question: "A put seller's maximum profit is:",
        options: [
          "Unlimited",
          "The premium received",
          "Strike minus premium",
          "The strike price",
        ],
        correct: 1,
        explanation:
          "If the put expires worthless, the seller keeps the entire premium. That is the maximum profit; losses can be much larger if the underlying falls.",
        difficulty: "Beginner",
        category: "Puts",
      },
      {
        id: "put-sell-q2",
        question: "A cash-secured put seller should:",
        options: [
          "Keep no cash aside and rely on margin",
          "Set aside enough cash to buy the underlying at the strike",
          "Buy a call as protection",
          "Sell the underlying short",
        ],
        correct: 1,
        explanation:
          "Cash-secured means the seller has the cash ready to take delivery if assigned. This avoids forced liquidation and makes the obligation explicit.",
        difficulty: "Beginner",
        category: "Puts",
      },
    ],
  },
  {
    slug: "put-outcomes",
    title: "Reading put outcomes",
    summary: "Insurance, speculation and the hidden cost of protection.",
    minutes: 9,
    demo: "option-payoff",
    demoConfig: { type: "put", side: "long", initialSpot: 1000, initialStrike: 1000, initialPremium: 40 },
    visual: "payoff-put",
    simple: [
      "A put's payoff is the mirror of a call: flat below the break-even, then rising as the underlying falls. The premium shifts the entire payoff down by its cost.",
      "For a stockholder, a put creates a floor. If the stock is ₹1,000 and you buy a ₹950 put for ₹25, your worst-case value near expiry is ₹925 plus any dividends — the put pays below ₹950. This is a protective put.",
      "Protection is not free. Over many months, repeated put purchases can cost more than the losses they prevent. Puts are most useful when the risk is concentrated, the horizon is defined, and volatility is not already extreme.",
    ],
    analogy:
      "A seatbelt does not make driving free of risk, and it costs money and effort to use. But on the day of an accident it changes the outcome dramatically. Portfolio insurance works the same way: a drag in normal times, a lifeline in a crash.",
    example: {
      intro:
        "You own stock at ₹1,000 and buy a ₹950-strike put for ₹25. Compare the protected outcome with holding the stock alone.",
      rows: [
        { label: "Stock falls to ₹800", value: "Stock −₹200 · Protected ≈ −₹75", tone: "neutral" },
        { label: "Stock stays ₹1,000", value: "Stock ₹0 · Protected −₹25", tone: "bear" },
        { label: "Stock rises to ₹1,200", value: "Stock +₹200 · Protected +₹175", tone: "bull" },
        { label: "Protection cost", value: "₹25 per unit" },
        { label: "Protection floor", value: "₹925 (strike − premium)" },
      ],
      conclusion:
        "The put caps the downside but reduces upside by the premium. It is a trade-off, not a free hedge. Size the insurance relative to the portfolio and the horizon you actually fear.",
    },
    mistakes: [
      "Buying puts after a crash when implied volatility is highest and protection is most expensive.",
      "Hedging a tiny position with an expensive put. Transaction costs can exceed the benefit.",
      "Forgetting that a protective put has an expiry. Insurance must be renewed.",
    ],
    takeaways: [
      "Puts can be speculative or protective; the payoff is the same, the purpose differs.",
      "Protective puts create a floor but cost premium and cap upside.",
      "Hedge cost, timing and volatility matter as much as the strike.",
    ],
    quiz: [
      {
        id: "put-out-q1",
        question: "A protective put is used to:",
        options: [
          "Increase upside on a stock holding",
          "Limit downside on a stock holding at the cost of premium",
          "Guarantee a profit",
          "Eliminate all market risk for free",
        ],
        correct: 1,
        explanation:
          "The put creates a floor below which the combined position stops losing. The cost is the premium, and upside is reduced by that cost.",
        difficulty: "Beginner",
        category: "Puts",
      },
      {
        id: "put-out-q2",
        question: "A long put is in the money at expiry when:",
        options: [
          "Spot is above the strike",
          "Spot equals the strike",
          "Spot is below the strike",
          "Implied volatility is zero",
        ],
        correct: 2,
        explanation:
          "A put gives the right to sell at the strike. When spot is below the strike, exercising produces positive intrinsic value.",
        difficulty: "Beginner",
        category: "Puts",
      },
    ],
  },
];
