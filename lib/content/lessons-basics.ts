import type { LessonSeed } from "@/lib/lessons";

export const basicsLessons: LessonSeed[] = [
  {
    slug: "what-is-a-stock",
    title: "What is a stock?",
    summary: "A share is a slice of a real business — the foundation every derivative is built on.",
    minutes: 7,
    demo: "stock-ownership",
    visual: "stock-value",
    simple: [
      "A stock (or share) is a unit of ownership in a company. Buy one share of Reliance and you own a tiny fraction of Reliance's factories, cash flows and future profits.",
      "Share prices change because buyers and sellers continuously revise what they think that ownership is worth. Profits, growth, interest rates, news and fear all feed into those expectations.",
      "You make money from a stock in two ways: the price rises, or the company pays you a dividend. Options are contracts whose value depends on a stock or index — so understanding the underlying matters.",
    ],
    analogy:
      "Imagine a pizza cut into 100 slices. Each slice is one share. If the pizza becomes more popular and people believe it will taste better next year, a slice becomes more valuable. The pizza itself did not change overnight — expectations did.",
    example: {
      intro:
        "You buy 100 shares of a hypothetical company at ₹1,450 each. A year later the price is ₹1,595, a 10% gain.",
      rows: [
        { label: "Share price today", value: "₹1,450" },
        { label: "Shares purchased", value: "100" },
        { label: "Amount invested", value: "₹1,45,000" },
        { label: "Price after one year", value: "₹1,595" },
        { label: "Value of holding", value: "₹1,59,500", tone: "bull" },
        { label: "Unrealised gain", value: "+₹14,500 (10%)", tone: "bull" },
      ],
      conclusion:
        "If the price had fallen 10% instead, the same holding would be worth ₹1,30,500 — a ₹14,500 loss. Share ownership is simple, but it is not risk-free.",
    },
    mistakes: [
      "Thinking a ₹20 stock is 'cheaper' than a ₹2,000 stock. Price alone says nothing about value.",
      "Concentrating your entire capital in one company because you like its products.",
      "Confusing a good company with a good stock price. Great businesses can be overpriced.",
    ],
    takeaways: [
      "A stock is part-ownership of a business, not a lottery ticket.",
      "Returns come from price appreciation and dividends.",
      "Options are priced from the behaviour of an underlying stock or index.",
    ],
    quiz: [
      {
        id: "basics-stock-q1",
        question: "What does owning one share of a company represent?",
        options: [
          "A loan made to the company",
          "A fractional ownership stake in the company",
          "A guarantee that the share price will rise",
          "A right to sell the company's products at a discount",
        ],
        correct: 1,
        explanation:
          "A share represents fractional ownership — a claim on the company's future cash flows and assets. A loan would be a bond, and no investment guarantees a rising price.",
        difficulty: "Beginner",
        category: "Basics",
      },
      {
        id: "basics-stock-q2",
        question:
          "You own 50 shares bought at ₹1,000. The price rises 10%. What is the holding worth?",
        options: ["₹50,000", "₹55,000", "₹5,000", "₹1,100"],
        correct: 1,
        explanation:
          "A 10% rise takes the price to ₹1,100. 50 × ₹1,100 = ₹55,000, a gain of ₹5,000.",
        difficulty: "Beginner",
        category: "Basics",
      },
    ],
  },
  {
    slug: "what-is-a-derivative",
    title: "What is a derivative?",
    summary: "A contract that derives its value from something else — and why that creates leverage.",
    minutes: 8,
    demo: "leverage",
    visual: "leverage",
    simple: [
      "A derivative is a financial contract whose value comes from an underlying asset: a stock, an index, a currency, a commodity or even an interest rate.",
      "You do not need to own the underlying to trade a derivative. You and a counterparty agree on terms — a price, a date, a payoff formula — and settle later.",
      "Because a small amount of capital controls a large notional exposure, derivatives are leveraged. Leverage magnifies both gains and losses. It is a tool, not a shortcut.",
    ],
    analogy:
      "Think of a deposit on a flat. You pay ₹2 lakh today to lock the price of a ₹1 crore apartment for three months. If the apartment's value rises ₹10 lakh, your ₹2 lakh deposit controlled a much larger move. If the deal falls through, you can lose the deposit. The contract derives its value from the flat, not from the deposit itself.",
    example: {
      intro:
        "NIFTY is at 25,000. One futures contract has a lot size of 75, so the notional value is 75 × 25,000 = ₹18,75,000. The broker requires roughly ₹1,50,000 as margin.",
      rows: [
        { label: "Index level", value: "25,000" },
        { label: "Lot size", value: "75" },
        { label: "Notional exposure", value: "₹18,75,000" },
        { label: "Margin required", value: "≈ ₹1,50,000" },
        { label: "Index moves 1%", value: "250 points" },
        { label: "Gain / loss", value: "±₹18,750", tone: "neutral" },
      ],
      conclusion:
        "A 1% index move is about 12.5% of the margin. That is leverage. The notional exposure — ₹18.75 lakh — is the number that matters for risk, not the margin you post.",
    },
    mistakes: [
      "Mistaking the margin for the maximum possible loss. Margin is a deposit; losses can exceed it.",
      "Trading a derivative without understanding the underlying's lot size and expiry.",
      "Assuming leverage increases the probability of profit. It only increases the size of outcomes.",
    ],
    takeaways: [
      "Derivatives derive value from an underlying and settle at a future date.",
      "No ownership is required, which is what makes leverage possible.",
      "Always compare risk to notional exposure, not just the margin paid.",
    ],
    quiz: [
      {
        id: "basics-derivative-q1",
        question: "What gives a derivative its value?",
        options: [
          "The broker's margin requirement",
          "The price of an underlying asset or reference rate",
          "The number of shares outstanding",
          "The dividend history of the exchange",
        ],
        correct: 1,
        explanation:
          "A derivative is a contract whose payoff is linked to an underlying asset or reference, such as a stock, index or interest rate.",
        difficulty: "Beginner",
        category: "Basics",
      },
      {
        id: "basics-derivative-q2",
        question:
          "A derivative position has ₹18,75,000 notional exposure and ₹1,50,000 margin. A 1% adverse move is roughly:",
        options: [
          "₹1,500 — 1% of margin",
          "₹18,750 — about 12.5% of margin",
          "₹1,50,000 — the entire margin",
          "₹18,75,000 — the entire notional",
        ],
        correct: 1,
        explanation:
          "1% of ₹18,75,000 is ₹18,750. Relative to the ₹1,50,000 margin, that is a 12.5% loss — the magnification created by leverage.",
        difficulty: "Beginner",
        category: "Basics",
      },
    ],
  },
  {
    slug: "what-is-an-option",
    title: "What is an option?",
    summary: "A right, not an obligation — the one sentence that explains the entire instrument.",
    minutes: 9,
    demo: "option-payoff",
    demoConfig: { type: "call", side: "long", initialSpot: 1000, initialStrike: 1000, initialPremium: 50 },
    visual: "payoff-call",
    simple: [
      "An option is a contract that gives its buyer a right — but not an obligation — to buy or sell an underlying asset at a fixed price on or before a fixed date.",
      "The fixed price is the strike price. The date is the expiry. The price the buyer pays for the right is the premium.",
      "The buyer can walk away if the deal is unfavourable, losing only the premium. The seller keeps the premium but must honour the contract if the buyer exercises. That asymmetry is the heart of options.",
    ],
    analogy:
      "You pay ₹50,000 for a three-month option to buy a ₹1 crore apartment at today's price. If prices surge, you exercise and buy cheaply. If prices fall, you simply do not buy — you lose the ₹50,000 token, not ₹1 crore. The token is the premium; the locked price is the strike.",
    example: {
      intro:
        "A stock trades at ₹1,000. You buy one call option with a ₹1,000 strike and pay a ₹50 premium. At expiry, you decide whether to exercise.",
      rows: [
        { label: "Stock at expiry", value: "₹1,100" },
        { label: "Call intrinsic value", value: "₹100" },
        { label: "Premium paid", value: "₹50" },
        { label: "Net profit", value: "+₹50", tone: "bull" },
        { label: "Stock at expiry instead", value: "₹900" },
        { label: "Net loss", value: "−₹50 (walk away)", tone: "bear" },
      ],
      conclusion:
        "The worst case for this call buyer is losing the ₹50 premium. The seller's worst case is not limited, because the stock can keep rising.",
    },
    mistakes: [
      "Treating an option as a share of stock. It is a contract with an expiry.",
      "Forgetting that the premium is paid upfront and is gone even if the option expires worthless.",
      "Buying deep out-of-the-money options because they are 'cheap' without checking the probability of payoff.",
    ],
    takeaways: [
      "An option gives the buyer a right; the seller carries an obligation.",
      "Strike and expiry define the contract; premium is its price.",
      "Limited downside for the buyer is exchanged for a cost that decays with time.",
    ],
    quiz: [
      {
        id: "basics-option-q1",
        question: "An option buyer has:",
        options: [
          "An obligation to buy or sell at the strike",
          "A right, but not an obligation, to buy or sell at the strike",
          "A guaranteed profit if the stock moves",
          "Ownership of the underlying shares from day one",
        ],
        correct: 1,
        explanation:
          "The defining feature of an option is optionality: the buyer can choose whether to exercise. The seller has the corresponding obligation.",
        difficulty: "Beginner",
        category: "Basics",
      },
      {
        id: "basics-option-q2",
        question:
          "You pay ₹50 for a ₹1,000-strike call. The stock ends at ₹900. What happens?",
        options: [
          "You are forced to buy at ₹1,000 and lose ₹100",
          "You exercise and break even",
          "You let it expire and lose the ₹50 premium",
          "You receive ₹50 from the seller",
        ],
        correct: 2,
        explanation:
          "The call is out of the money at expiry, so the rational choice is not to exercise. The maximum loss is the premium already paid.",
        difficulty: "Beginner",
        category: "Basics",
      },
    ],
  },
  {
    slug: "calls-and-puts",
    title: "Calls and puts, buyers and sellers",
    summary: "Four positions, two directions, one visual map — the language of every option trade.",
    minutes: 9,
    demo: "buyer-seller",
    visual: "buyer-seller",
    simple: [
      "A call gives the buyer the right to buy the underlying at the strike. It profits when the underlying rises above strike + premium.",
      "A put gives the buyer the right to sell the underlying at the strike. It profits when the underlying falls below strike − premium.",
      "Every option has two sides. The buyer pays the premium and owns the right. The seller receives the premium and accepts the obligation. Buyers are long optionality; sellers are short optionality.",
    ],
    analogy:
      "A call is a locked-in purchase coupon for a house. A put is a price-floor insurance policy on that house. The coupon buyer hopes prices rise; the insurer hopes the house stays above the floor. Both are useful — for opposite reasons.",
    example: {
      intro:
        "Spot is ₹1,000. Compare a ₹1,000-strike call bought for ₹50 with a ₹1,000-strike put bought for ₹40.",
      rows: [
        { label: "Price at expiry ₹900", value: "Call −₹50 · Put +₹60", tone: "neutral" },
        { label: "Price at expiry ₹1,000", value: "Call −₹50 · Put −₹40", tone: "neutral" },
        { label: "Price at expiry ₹1,100", value: "Call +₹50 · Put −₹40", tone: "neutral" },
        { label: "Call break-even", value: "₹1,050" },
        { label: "Put break-even", value: "₹960" },
      ],
      conclusion:
        "Buying a call is a bet on strength. Buying a put is a bet on weakness — or an insurance policy. Selling either one flips the payoff and adds obligation.",
    },
    mistakes: [
      "Thinking a put is the same as short-selling a stock. A put is a separate contract with limited loss for the buyer.",
      "Believing the seller of an option keeps the premium with no risk. The premium is compensation for taking risk.",
      "Ignoring the contract multiplier when translating points into rupees.",
    ],
    takeaways: [
      "Calls profit from upside; puts profit from downside.",
      "Buyers pay premium and have limited loss; sellers collect premium and carry obligation.",
      "Direction and role are independent choices: bullish, bearish, long or short.",
    ],
    quiz: [
      {
        id: "basics-callput-q1",
        question: "Which option gives its buyer the right to sell the underlying at the strike?",
        options: ["Call option", "Put option", "Futures contract", "Covered call"],
        correct: 1,
        explanation:
          "A put gives the buyer the right to sell at the strike. It becomes more valuable as the underlying falls.",
        difficulty: "Beginner",
        category: "Basics",
      },
      {
        id: "basics-callput-q2",
        question: "Who receives the premium in an option transaction?",
        options: [
          "The option buyer",
          "The option seller",
          "The exchange",
          "The underlying company",
        ],
        correct: 1,
        explanation:
          "The buyer pays the premium to the seller in exchange for the right embedded in the contract. The seller keeps the premium but accepts the obligation.",
        difficulty: "Beginner",
        category: "Basics",
      },
    ],
  },
  {
    slug: "buying-vs-selling",
    title: "Buying vs selling options",
    summary: "Two very different businesses: buying optionality versus underwriting it.",
    minutes: 10,
    demo: "buyer-seller",
    visual: "buyer-seller",
    simple: [
      "Option buyers pay premium. Their maximum loss is the premium, but time decay works against them. They need the underlying to move enough, fast enough, or volatility to rise.",
      "Option sellers collect premium. Their maximum profit is the premium, but their risk can be large or unlimited. Time decay works for them; a sudden adverse move works against them.",
      "Neither side is 'right'. Buying is a bet on movement or volatility. Selling is a bet on stability, decay or a range. Both must be sized and risk-managed.",
    ],
    analogy:
      "Think of insurance. The buyer pays a premium for protection and hopes never to need it. The insurer collects many premiums, usually profits, but must survive the rare catastrophe. Selling naked options is like underwriting catastrophe risk without a reinsurance limit.",
    example: {
      intro:
        "A call has a ₹50 premium and a lot size of 75, so one contract costs 75 × ₹50 = ₹3,750. Compare a buyer and a seller if the index rises 500 points by expiry.",
      rows: [
        { label: "Buyer pays", value: "₹3,750 upfront" },
        { label: "Seller receives", value: "₹3,750 upfront" },
        { label: "Index rises 500", value: "Intrinsic gain 500 × 75 = ₹37,500", tone: "bull" },
        { label: "Buyer net", value: "+₹33,750", tone: "bull" },
        { label: "Seller net", value: "−₹33,750", tone: "bear" },
        { label: "Index falls below strike", value: "Buyer −₹3,750 · Seller +₹3,750" },
      ],
      conclusion:
        "The seller wins small and often; the buyer loses small and often but can win big. Sizing is what keeps either strategy survivable.",
    },
    mistakes: [
      "Selling naked options for income without understanding margin and tail risk.",
      "Buying short-dated options without a plan for time decay.",
      "Judging a strategy by win rate alone. High win rate can hide a catastrophic loss.",
    ],
    takeaways: [
      "Buyers have limited loss and unlimited profit potential (for calls); sellers have the reverse.",
      "Time decay is an enemy of buyers and a friend of sellers.",
      "Win rate and payoff size must be evaluated together, not separately.",
    ],
    quiz: [
      {
        id: "basics-buysell-q1",
        question: "Which statement is true for an option seller?",
        options: [
          "Maximum loss is always limited to the premium received",
          "They collect premium and accept an obligation",
          "They have no margin requirement",
          "They benefit when implied volatility rises",
        ],
        correct: 1,
        explanation:
          "Sellers receive premium and are obligated to perform if the buyer exercises. Risk can be unlimited (naked calls) or very large, and volatility expansion hurts short options.",
        difficulty: "Beginner",
        category: "Basics",
      },
      {
        id: "basics-buysell-q2",
        question: "Time decay generally:",
        options: [
          "Helps option buyers",
          "Helps option sellers",
          "Affects only futures",
          "Has no effect on option prices",
        ],
        correct: 1,
        explanation:
          "As expiry approaches, the time value of an option erodes. Buyers of options are hurt; sellers who collected premium benefit, all else equal.",
        difficulty: "Beginner",
        category: "Basics",
      },
    ],
  },
  {
    slug: "options-vs-futures",
    title: "Options vs futures",
    summary: "Rights versus obligations — and why the 'safer' instrument is not always safer.",
    minutes: 9,
    demo: "leverage",
    visual: "leverage",
    simple: [
      "Futures and options are both derivatives, but their obligations differ. A futures contract obligates both sides to settle at the agreed price. An option gives the buyer a choice.",
      "Both futures and short options require margin and are marked to market. Long options require no margin beyond the premium, but they suffer time decay.",
      "Futures are cleaner for pure directional exposure. Options add dimensions — time and volatility — and make it possible to define risk precisely. More choice also means more ways to make mistakes.",
    ],
    analogy:
      "A futures contract is a firm handshake: both parties must complete the deal. An option is a paid reservation: the buyer may complete the deal, the seller must if asked. The reservation has an expiry; the handshake does not.",
    example: {
      intro:
        "NIFTY is at 25,000 with a lot size of 75. You are bearish and compare a futures short with buying a put.",
      rows: [
        { label: "Futures short exposure", value: "₹18,75,000 notional" },
        { label: "Index falls 1% (250 points)", value: "Futures +₹18,750", tone: "bull" },
        { label: "Put premium (₹150 × 75)", value: "₹11,250 cost" },
        { label: "Put payoff on 1% fall", value: "≈ ₹18,750 − 11,250 = +₹7,500", tone: "bull" },
        { label: "If index rises 1%", value: "Futures −₹18,750 · Put −₹11,250 max" },
        { label: "Margin", value: "Both futures and short options require margin" },
      ],
      conclusion:
        "The put defines risk but costs premium and gives up some upside. The future is cheaper in premium terms but has no floor on losses. Choose based on the risk shape you want, not on the label.",
    },
    mistakes: [
      "Buying options for every view because they 'only risk premium' — repeated premium spending can compound quickly.",
      "Assuming futures are riskier in every way. A long option has time decay; a future does not.",
      "Holding either instrument into expiry without understanding settlement.",
    ],
    takeaways: [
      "Futures: symmetric obligation. Options: asymmetric right for the buyer.",
      "Options add time and volatility risk; futures add daily mark-to-market risk.",
      "Instrument choice should follow the desired payoff shape and risk budget.",
    ],
    quiz: [
      {
        id: "basics-futures-q1",
        question: "What is the key difference between a futures contract and a long option?",
        options: [
          "Futures have no expiry",
          "A long option gives a right; a future creates an obligation",
          "Only futures have margin requirements",
          "Options always have lower risk",
        ],
        correct: 1,
        explanation:
          "Both are derivatives, but the long option holder can choose not to exercise. Futures obligate both sides to settle. Long options also cost premium and decay.",
        difficulty: "Beginner",
        category: "Basics",
      },
      {
        id: "basics-futures-q2",
        question: "Which risk is unique to long options compared with futures?",
        options: [
          "Leverage risk",
          "Time decay of premium",
          "Counterparty risk",
          "Directional risk",
        ],
        correct: 1,
        explanation:
          "Long options pay a premium that erodes as expiry approaches. Futures have no time value to decay, though they do have leverage and mark-to-market risk.",
        difficulty: "Beginner",
        category: "Basics",
      },
    ],
  },
];
