import type { LessonSeed } from "@/lib/lessons";

export const callLessons: LessonSeed[] = [
  {
    slug: "buying-calls",
    title: "Buying a call option",
    summary: "Limited risk, uncapped upside — and a break-even that is always above the strike.",
    minutes: 10,
    demo: "option-payoff",
    demoConfig: { type: "call", side: "long", initialSpot: 1000, initialStrike: 1000, initialPremium: 50 },
    visual: "payoff-call",
    simple: [
      "A call buyer pays a premium for the right to buy the underlying at the strike. The trade profits when the underlying rises enough to cover the premium.",
      "Maximum loss is the premium paid. Maximum profit is theoretically unlimited because the underlying can keep rising. The break-even is strike + premium.",
      "Buying calls is not just 'bullish'. You also need the move to happen before time decay erodes the premium, and ideally you want implied volatility to rise or at least not collapse.",
    ],
    analogy:
      "You pay ₹50 for a coupon that lets you buy a ₹1,000 item at ₹1,000 for the next month. If the item's market price jumps to ₹1,100, the coupon is worth ₹100. If the price falls, you throw the coupon away and lose ₹50 — never more.",
    example: {
      intro:
        "Spot is ₹1,000. Buy a ₹1,000-strike call for ₹50. Quantity is 1 unit for simplicity; with a NIFTY lot of 75, multiply every number by 75.",
      rows: [
        { label: "Premium paid", value: "₹50" },
        { label: "Break-even at expiry", value: "₹1,050 (strike + premium)" },
        { label: "Maximum loss", value: "₹50 (premium)", tone: "bear" },
        { label: "Maximum profit", value: "Unlimited", tone: "bull" },
        { label: "Spot at expiry ₹900", value: "−₹50", tone: "bear" },
        { label: "Spot at expiry ₹1,050", value: "₹0" },
        { label: "Spot at expiry ₹1,100", value: "+₹50", tone: "bull" },
        { label: "Spot at expiry ₹1,200", value: "+₹150", tone: "bull" },
      ],
      conclusion:
        "Every point above ₹1,050 adds ₹1 of profit per unit. Every point below the strike loses nothing more than the ₹50 already paid. The payoff is asymmetric in the buyer's favour — but only if the move is large enough and fast enough.",
    },
    mistakes: [
      "Buying a call and expecting to profit from a small rise. The premium sets a hurdle above the strike.",
      "Choosing very short-dated options because they are cheap, then getting crushed by theta.",
      "Sizing too large because 'loss is limited'. A 100% loss of a large position is still a large loss.",
    ],
    takeaways: [
      "Long call: bullish, limited risk, unlimited upside.",
      "Break-even = strike + premium at expiry.",
      "Time and implied volatility matter as much as direction.",
    ],
    quiz: [
      {
        id: "call-buy-q1",
        question: "You buy a ₹500-strike call for ₹20. What is the break-even at expiry?",
        options: ["₹480", "₹500", "₹520", "₹540"],
        correct: 2,
        explanation:
          "The call buyer needs the underlying above strike + premium = 500 + 20 = ₹520 to profit at expiry.",
        difficulty: "Beginner",
        category: "Calls",
      },
      {
        id: "call-buy-q2",
        question: "What is the maximum loss on a long call?",
        options: [
          "Unlimited",
          "The strike price",
          "The premium paid",
          "Strike minus premium",
        ],
        correct: 2,
        explanation:
          "The buyer can choose not to exercise, so the loss is capped at the premium. The seller, by contrast, can face unlimited loss on a naked call.",
        difficulty: "Beginner",
        category: "Calls",
      },
    ],
  },
  {
    slug: "selling-calls",
    title: "Selling a call option",
    summary: "Collect premium, accept obligation — the mirror image, with a very different risk profile.",
    minutes: 10,
    demo: "option-payoff",
    demoConfig: { type: "call", side: "short", initialSpot: 1000, initialStrike: 1000, initialPremium: 50 },
    visual: "payoff-call",
    simple: [
      "A call seller (writer) receives the premium and takes on the obligation to sell the underlying at the strike if assigned. The best case is that the option expires worthless: the seller keeps the entire premium.",
      "The seller's break-even is the same as the buyer's: strike + premium. Above that level the seller loses point for point. A naked call has theoretically unlimited risk; a covered call is capped by owning the underlying.",
      "Selling calls benefits from time decay, falling implied volatility and a flat-to-lower underlying. It is a high-probability, limited-reward strategy that can suffer large losses in a sharp rally.",
    ],
    analogy:
      "You are the insurer. You collect a small premium for promising to sell your house at a fixed price. Most months the promise expires unused and you keep the fee. If the housing market explodes above your strike, you must sell cheap and forgo the gain — or buy the promise back at a large loss.",
    example: {
      intro:
        "Spot is ₹1,000. Sell a ₹1,000-strike call for ₹50. One unit is shown; multiply by lot size for a real contract.",
      rows: [
        { label: "Premium received", value: "+₹50", tone: "bull" },
        { label: "Break-even at expiry", value: "₹1,050" },
        { label: "Maximum profit", value: "₹50 (premium)", tone: "bull" },
        { label: "Maximum loss", value: "Unlimited (naked call)", tone: "bear" },
        { label: "Spot at expiry ₹900", value: "+₹50", tone: "bull" },
        { label: "Spot at expiry ₹1,100", value: "−₹50", tone: "bear" },
        { label: "Spot at expiry ₹1,300", value: "−₹250", tone: "bear" },
      ],
      conclusion:
        "The seller wins ₹50 in calm or falling markets but loses ₹1 for every point above ₹1,050. A single sharp rally can wipe out many months of premium. Position size and a defined-risk hedge matter more than the win rate.",
    },
    mistakes: [
      "Selling naked calls for income without understanding unlimited loss and margin calls.",
      "Forgetting early assignment risk when the call is deep in the money or a dividend is due.",
      "Comparing the premium received with the notional risk. ₹50 of income against unlimited risk is not a free lunch.",
    ],
    takeaways: [
      "Short call: neutral-to-bearish, capped profit, large or unlimited risk.",
      "Premium is income only if the risk is sized and hedged.",
      "Covered calls trade upside for income; naked calls add tail risk.",
    ],
    quiz: [
      {
        id: "call-sell-q1",
        question: "A naked call seller's maximum loss is:",
        options: [
          "The premium received",
          "The strike price",
          "Unlimited",
          "Strike plus premium",
        ],
        correct: 2,
        explanation:
          "The underlying can rise without a theoretical ceiling, so a naked call's loss is unlimited. Buying the underlying (covered call) or a higher-strike call caps it.",
        difficulty: "Beginner",
        category: "Calls",
      },
      {
        id: "call-sell-q2",
        question: "Which market outcome most helps a short call position?",
        options: [
          "A sharp rally in the underlying",
          "A rise in implied volatility",
          "The underlying staying below the strike as time passes",
          "A dividend announcement",
        ],
        correct: 2,
        explanation:
          "Time decay and a flat-to-lower underlying help the seller keep the premium. A rally or volatility spike hurts a short call.",
        difficulty: "Beginner",
        category: "Calls",
      },
    ],
  },
  {
    slug: "call-outcomes",
    title: "Reading call outcomes",
    summary: "From payoff table to decision: when a call trade actually makes sense.",
    minutes: 9,
    demo: "option-payoff",
    demoConfig: { type: "call", side: "long", initialSpot: 1000, initialStrike: 1000, initialPremium: 50 },
    visual: "payoff-call",
    simple: [
      "A call trade has three moving parts: the size of the move, the time it takes, and the change in implied volatility. Direction alone is not enough.",
      "At expiry, the payoff is a simple kink: zero below the strike, then a straight line above it, shifted down by the premium. Before expiry, the curve is smooth because time value remains.",
      "Use the break-even and probability as filters. A cheap OTM call needs a large move to pay; an ATM call needs a moderate move; a deep ITM call behaves more like stock but ties up more capital.",
    ],
    analogy:
      "Three archers aim at the same target. One buys an arrow close to the bullseye (ITM), one aims at the bullseye (ATM), one aims at the outer ring (OTM). The outer-ring arrow is cheapest, but it needs a much more precise outcome.",
    example: {
      intro:
        "The ₹1,000-strike call costs ₹50. Here is the expiry outcome across a range of prices, and what it teaches.",
      rows: [
        { label: "₹850 (−15%)", value: "−₹50 · total loss", tone: "bear" },
        { label: "₹950 (−5%)", value: "−₹50 · still worthless", tone: "bear" },
        { label: "₹1,050 (+5%)", value: "₹0 · break-even" },
        { label: "₹1,150 (+15%)", value: "+₹100 · 200% of premium", tone: "bull" },
        { label: "₹1,250 (+25%)", value: "+₹200 · 400% of premium", tone: "bull" },
      ],
      conclusion:
        "The call needs a move above 5% just to break even. That does not make it a bad trade — but it does mean 'I think the stock will go up' is not a complete thesis. You need a view on magnitude, timing and volatility.",
    },
    mistakes: [
      "Buying a call without a target price. If your target is below break-even, the trade is inconsistent.",
      "Holding a winning call too long and giving back the gain to theta.",
      "Adding to a losing call simply because it became cheaper.",
    ],
    takeaways: [
      "At expiry, a long call's P&L is max(0, spot − strike) − premium.",
      "Break-even is the minimum move required; probability of reaching it matters.",
      "Exit plans should account for both price and time.",
    ],
    quiz: [
      {
        id: "call-out-q1",
        question:
          "A ₹1,000-strike call cost ₹60. At expiry the underlying is ₹1,040. What is the result?",
        options: ["+₹40 profit", "−₹20 loss", "−₹60 loss", "+₹20 profit"],
        correct: 1,
        explanation:
          "Intrinsic value is ₹40. Subtract the ₹60 premium: 40 − 60 = −₹20. Being in the money at expiry does not guarantee a profit.",
        difficulty: "Beginner",
        category: "Calls",
      },
      {
        id: "call-out-q2",
        question: "A long call's payoff at expiry is maximised when:",
        options: [
          "The underlying finishes exactly at the strike",
          "The underlying finishes below the strike",
          "The underlying finishes as high as possible",
          "Implied volatility falls to zero",
        ],
        correct: 2,
        explanation:
          "Above break-even, every additional point of underlying price adds one point of profit per unit. There is no upside cap for a long call.",
        difficulty: "Beginner",
        category: "Calls",
      },
    ],
  },
];
