import type { LessonSeed } from "@/lib/lessons";

export const greeksLessons: LessonSeed[] = [
  {
    slug: "delta-and-gamma",
    title: "Delta and gamma",
    summary: "Speed and acceleration: how option prices respond to the underlying.",
    minutes: 11,
    demo: "greeks",
    visual: "delta",
    simple: [
      "**Delta** measures how much an option's price changes when the underlying moves by one unit. A call delta of 0.55 means a ₹1 rise in the stock adds about ₹0.55 to the option price, for a very small move.",
      "Calls have delta between 0 and 1; puts have delta between −1 and 0. Deep ITM options approach ±1, ATM options sit near ±0.5, and far OTM options approach zero. Delta is not the probability of profit, although it is often used as a rough proxy.",
      "**Gamma** measures how fast delta changes. It is highest for at-the-money options and rises sharply near expiry. Long options have positive gamma; short options have negative gamma. Gamma is why a short option can become dangerous very quickly.",
    ],
    analogy:
      "Delta is the speedometer; gamma is the accelerator. A car cruising at 55 km/h has a speed of 55. If it is also accelerating hard, the speed next minute will be higher. An option's delta is its current speed; gamma tells you how much that speed is likely to change.",
    example: {
      intro:
        "A call has delta 0.55, gamma 0.003, and the stock moves ₹10. One unit is shown; multiply by the lot size for the contract.",
      rows: [
        { label: "Initial option price", value: "₹30" },
        { label: "Delta", value: "0.55" },
        { label: "Stock rises ₹10", value: "Delta effect ≈ +₹5.50" },
        { label: "New delta (approx.)", value: "0.55 + 10 × 0.003 = 0.58" },
        { label: "Stock falls ₹10 instead", value: "Delta effect ≈ −₹5.50", tone: "bear" },
        { label: "For a NIFTY lot of 75", value: "Position delta = 0.55 × 75 = 41.25" },
      ],
      conclusion:
        "The deeper in the money the option becomes, the more its delta approaches 1 — it starts behaving like stock. Gamma is small for long-dated options and violent for short-dated ATM options.",
    },
    mistakes: [
      "Treating delta as the probability of expiring in the money. It is a sensitivity, not a forecast.",
      "Ignoring gamma when short options are near expiry. Delta can flip from 0.3 to 0.8 in hours.",
      "Comparing per-contract delta without multiplying by lot size. Position delta is what moves your P&L.",
    ],
    takeaways: [
      "Delta is the option's sensitivity to the underlying; gamma is the sensitivity of delta.",
      "Calls: 0 to +1. Puts: −1 to 0. ATM is near ±0.5.",
      "Long options are gamma-positive; short options are gamma-negative and can accelerate against you.",
    ],
    quiz: [
      {
        id: "greeks-delta-q1",
        question: "A call option has delta 0.40. If the underlying rises by ₹5, the option price is expected to change by approximately:",
        options: ["₹0.40", "₹2.00", "₹5.00", "₹20.00"],
        correct: 1,
        explanation:
          "Delta × change in underlying = 0.40 × 5 = ₹2.00, for a small move. Gamma would adjust delta for a larger move.",
        difficulty: "Intermediate",
        category: "Greeks",
      },
      {
        id: "greeks-delta-q2",
        question: "Gamma is typically highest for:",
        options: [
          "Deep ITM options with 6 months left",
          "At-the-money options close to expiry",
          "Deep OTM options with 1 year left",
          "The underlying stock itself",
        ],
        correct: 1,
        explanation:
          "ATM options near expiry have deltas that can swing rapidly between 0 and 1, so gamma peaks there. This is why expiry-week short options can be so volatile.",
        difficulty: "Intermediate",
        category: "Greeks",
      },
    ],
  },
  {
    slug: "theta",
    title: "Theta in practice",
    summary: "The cost of waiting — and the hidden gamma bill that comes with collecting it.",
    minutes: 10,
    demo: "theta-decay",
    visual: "theta",
    simple: [
      "Theta is the change in an option's price for one day passing, holding everything else constant. Long options have negative theta; short options have positive theta.",
      "Theta is not a fixed daily fee. It accelerates near expiry and is largest for ATM options. Weekends and holidays are usually priced in, so the decay can appear as a jump on Monday.",
      "Selling theta is a real business with a real risk: negative gamma. A short option can collect ₹100 a day for weeks and then lose many times that in one volatile session. Theta strategies need strict sizing and hedges.",
    ],
    analogy:
      "Renting a car by the day: the rental cost is theta. If you keep the car for a road trip, the daily fee is the price of optionality. If you rent it out, you collect the fee — but you are responsible if the renter crashes it.",
    example: {
      intro:
        "An ATM call has a theoretical price of ₹24 with 30 days left and theta of −₹1.20 per day. You own one lot of 75 units.",
      rows: [
        { label: "Option value (per unit)", value: "₹24" },
        { label: "Theta per unit per day", value: "−₹1.20" },
        { label: "Daily bleed for 75 units", value: "−₹90", tone: "bear" },
        { label: "10 days of pure decay", value: "≈ −₹900", tone: "bear" },
        { label: "Short 75 units instead", value: "+₹90 per day, all else equal", tone: "bull" },
        { label: "If IV drops 3 points", value: "Additional loss for the long position", tone: "bear" },
      ],
      conclusion:
        "Theta is only one force. A long option can still profit if delta gains outrun decay. A short option can still lose if a volatility spike or a fast move swamps the premium collected. Always look at the Greeks together.",
    },
    mistakes: [
      "Buying short-dated options with no catalyst and hoping theta 'does not matter'.",
      "Selling short-dated options for small premiums without accounting for gamma risk.",
      "Forgetting that theta is already reflected in the premium. You cannot collect it for free.",
    ],
    takeaways: [
      "Theta is daily time decay: negative for long options, positive for short options.",
      "Decay accelerates near expiry and is largest at the money.",
      "Theta income comes with gamma and vega risk; never evaluate it in isolation.",
    ],
    quiz: [
      {
        id: "greeks-theta-q1",
        question: "An option has theta of −₹2 per day. If nothing else changes, after 5 days it loses approximately:",
        options: ["₹2", "₹5", "₹10", "₹20"],
        correct: 2,
        explanation:
          "Theta is a per-day estimate: 2 × 5 = ₹10. In reality theta itself changes as time passes, so the actual decay is non-linear.",
        difficulty: "Intermediate",
        category: "Greeks",
      },
      {
        id: "greeks-theta-q2",
        question: "Which position benefits from time decay?",
        options: [
          "Long call",
          "Long put",
          "Short straddle",
          "Long stock",
        ],
        correct: 2,
        explanation:
          "A short straddle has sold two options and collects theta. The buyer of either option pays theta. Long stock has no time value.",
        difficulty: "Intermediate",
        category: "Greeks",
      },
    ],
  },
  {
    slug: "vega-and-rho",
    title: "Vega and rho",
    summary: "The volatility dial and the interest-rate lever — smaller, but not irrelevant.",
    minutes: 10,
    demo: "greeks",
    visual: "vega",
    simple: [
      "**Vega** measures the change in option price for a one-percentage-point change in implied volatility. Long options are vega-positive: higher IV helps them. Short options are vega-negative.",
      "Vega is largest for at-the-money, longer-dated options. A 6-month ATM option has much more vega than a 3-day ATM option. This is why event-driven traders often prefer shorter expiries after the event is priced.",
      "**Rho** measures sensitivity to interest rates. Calls have positive rho and puts negative rho, but the effect is small for short-dated options and becomes more relevant for long-dated LEAPS and high-rate environments.",
    ],
    analogy:
      "Vega is a thermostat: turn the uncertainty up and every option in the room gets more expensive. Rho is a slow tide: it barely moves the boat over a day but can lift it meaningfully over a year.",
    example: {
      intro:
        "A 30-day ATM call has vega of ₹0.12 per 1% IV and rho of ₹0.04 per 1% rate. You hold 75 units.",
      rows: [
        { label: "IV rises 5 points", value: "≈ +₹0.60 per unit → +₹45 for 75", tone: "bull" },
        { label: "IV falls 5 points", value: "≈ −₹45 for 75", tone: "bear" },
        { label: "Rates rise 1 point", value: "≈ +₹3 for 75", tone: "bull" },
        { label: "6-month ATM vega", value: "Much higher than 30-day vega" },
        { label: "Event IV crush (30 → 18)", value: "≈ −₹1.44 per unit", tone: "bear" },
      ],
      conclusion:
        "Vega can easily overwhelm theta for a few days around an event. A long option that is right on direction can still lose if IV collapses. Rho is usually a secondary concern, but long-dated positions should not ignore it.",
    },
    mistakes: [
      "Buying options immediately before earnings without checking the IV crush risk.",
      "Selling long-dated options thinking vega is irrelevant. Long-dated vega is substantial.",
      "Ignoring the interest-rate component in long-dated LEAPS or deep ITM options.",
    ],
    takeaways: [
      "Vega: sensitivity to a 1% change in IV; highest ATM and for longer expiries.",
      "Rho: sensitivity to a 1% change in rates; small for short-dated options.",
      "Volatility changes can dominate direction over short horizons.",
    ],
    quiz: [
      {
        id: "greeks-vega-q1",
        question: "A long option position is:",
        options: [
          "Vega-positive and benefits from rising IV",
          "Vega-negative and benefits from falling IV",
          "Vega-neutral",
          "Unaffected by implied volatility",
        ],
        correct: 0,
        explanation:
          "Long options gain value when implied volatility rises, so they are vega-positive. Short options are vega-negative.",
        difficulty: "Intermediate",
        category: "Greeks",
      },
      {
        id: "greeks-vega-q2",
        question: "Vega is generally largest for:",
        options: [
          "Short-dated OTM options",
          "Longer-dated ATM options",
          "Deep ITM options at expiry",
          "The underlying stock",
        ],
        correct: 1,
        explanation:
          "More time and ATM moneyness give vega the most room to matter. A long-dated ATM option has much higher vega than a near-expiry OTM option.",
        difficulty: "Intermediate",
        category: "Greeks",
      },
    ],
  },
];
