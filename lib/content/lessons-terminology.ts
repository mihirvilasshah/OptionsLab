import type { LessonSeed } from "@/lib/lessons";

export const terminologyLessons: LessonSeed[] = [
  {
    slug: "contract-anatomy",
    title: "Anatomy of an option contract",
    summary: "Underlying, strike, premium, expiry, lot size and multiplier — the six fields that define every trade.",
    minutes: 9,
    demo: "contract-builder",
    visual: "strike-premium",
    simple: [
      "Every option contract names an **underlying** (NIFTY, Reliance, AAPL), a **type** (call or put), a **strike price**, an **expiry date**, and a **premium** quoted per unit. A **lot size** (India) or **contract multiplier** (US) converts the quoted premium into the actual rupees or dollars you pay.",
      "In India, NIFTY options trade in lots — for example, 75 units per lot. A premium of ₹120 means one lot costs 120 × 75 = ₹9,000. In the US, one standard equity option contract controls 100 shares, so a $5.00 premium costs $500.",
      "The strike and expiry are fixed by the exchange; the premium floats with the market. Two contracts with the same underlying but different strikes or expiries are different instruments with different prices.",
    ],
    analogy:
      "A restaurant reservation has a restaurant, a date, a time, a table size and a booking fee. Change the restaurant or the date and you have a different reservation. An option contract works the same way: its identity is the combination of underlying, type, strike and expiry — its 'address'. The premium is the booking fee.",
    example: {
      intro:
        "You buy one lot of the NIFTY 25,000 call expiring next Thursday. The quoted premium is ₹120 and the lot size is 75.",
      rows: [
        { label: "Underlying", value: "NIFTY 50" },
        { label: "Type", value: "Call" },
        { label: "Strike", value: "25,000" },
        { label: "Expiry", value: "Next Thursday" },
        { label: "Premium (per unit)", value: "₹120" },
        { label: "Lot size", value: "75" },
        { label: "Total premium paid", value: "₹9,000", tone: "neutral" },
      ],
      conclusion:
        "If the premium rises to ₹150 before expiry, the lot is worth ₹11,250 — a ₹2,250 gain before costs. If it expires worthless, the loss is the full ₹9,000.",
    },
    mistakes: [
      "Comparing a ₹5 stock option with a ₹100 index option without adjusting for lot size and contract value.",
      "Forgetting that premiums are quoted per unit, not per lot.",
      "Assuming lot sizes never change. Exchanges revise them periodically.",
    ],
    takeaways: [
      "An option's identity = underlying + type + strike + expiry.",
      "Lot size / multiplier converts premium per unit into total cash.",
      "The premium is what you pay or receive; the strike is the price you may trade at later.",
    ],
    quiz: [
      {
        id: "term-anatomy-q1",
        question:
          "A NIFTY call has a premium of ₹80 and a lot size of 75. What is the premium for one lot?",
        options: ["₹80", "₹750", "₹6,000", "₹8,000"],
        correct: 2,
        explanation:
          "Premium per unit × lot size = ₹80 × 75 = ₹6,000. The premium quote is per index unit, not per lot.",
        difficulty: "Beginner",
        category: "Terminology",
      },
      {
        id: "term-anatomy-q2",
        question: "Which two fields are fixed by the exchange for a listed option?",
        options: [
          "Premium and implied volatility",
          "Strike price and expiry date",
          "Premium and open interest",
          "Delta and theta",
        ],
        correct: 1,
        explanation:
          "Strike and expiry define the contract and are fixed. Premium, IV, delta and open interest change continuously in the market.",
        difficulty: "Beginner",
        category: "Terminology",
      },
    ],
  },
  {
    slug: "moneyness",
    title: "ITM, ATM and OTM",
    summary: "Where the spot sits relative to the strike — and why 'in the money' is not the same as 'profitable'.",
    minutes: 8,
    demo: "strike-ladder",
    visual: "strike-premium",
    simple: [
      "**In the money (ITM)** means exercising the option would have positive intrinsic value right now. A call is ITM when spot is above the strike; a put is ITM when spot is below the strike.",
      "**At the money (ATM)** means the strike is closest to the current spot. **Out of the money (OTM)** means exercise would be worthless right now: calls above spot, puts below spot.",
      "Moneyness changes as the underlying moves. A call can travel from OTM to ATM to ITM in a single session. The payoff at expiry depends on final moneyness minus the premium paid.",
    ],
    analogy:
      "A ₹1,000 gift card for a ₹1,100 item is 'in the money' — it is immediately useful. A card for a ₹1,300 item is out of the money today. But if the price later rises to ₹1,350, it becomes valuable. Moneyness is a snapshot, not a forecast.",
    example: {
      intro:
        "Spot is ₹1,000. Consider calls and puts at three strikes. 'Intrinsic' is the value if exercised immediately.",
      rows: [
        { label: "Call strike ₹950", value: "ITM · intrinsic ₹50", tone: "bull" },
        { label: "Call strike ₹1,000", value: "ATM · intrinsic ₹0" },
        { label: "Call strike ₹1,050", value: "OTM · intrinsic ₹0", tone: "bear" },
        { label: "Put strike ₹950", value: "OTM · intrinsic ₹0", tone: "bear" },
        { label: "Put strike ₹1,000", value: "ATM · intrinsic ₹0" },
        { label: "Put strike ₹1,050", value: "ITM · intrinsic ₹50", tone: "bull" },
      ],
      conclusion:
        "ITM with a ₹50 intrinsic is not automatically a winning trade. If you paid ₹70 for that call, you are still down ₹20 at expiry. Moneyness describes exercise value; profit depends on what you paid.",
    },
    mistakes: [
      "Believing ITM options are always profitable. Overpaying can turn an ITM payoff into a loss.",
      "Buying OTM options only because they are cheap. Their low price reflects a lower probability of payoff.",
      "Forgetting that moneyness has opposite meanings for calls and puts.",
    ],
    takeaways: [
      "Call: ITM above strike, OTM below. Put: ITM below strike, OTM above.",
      "ATM is determined by proximity to spot, not by a fixed number.",
      "Moneyness ≠ profitability. Premium paid determines the break-even.",
    ],
    quiz: [
      {
        id: "term-money-q1",
        question: "Spot is ₹500 and a call has a ₹480 strike. The call is:",
        options: ["Out of the money", "At the money", "In the money", "Worthless"],
        correct: 2,
        explanation:
          "A call is in the money when spot is above the strike. It has ₹20 of intrinsic value before considering the premium paid.",
        difficulty: "Beginner",
        category: "Terminology",
      },
      {
        id: "term-money-q2",
        question: "Which option is in the money when the underlying trades below the strike?",
        options: ["Call", "Put", "Both", "Neither"],
        correct: 1,
        explanation:
          "A put gives the right to sell above the market, so it gains intrinsic value when the underlying falls below the strike.",
        difficulty: "Beginner",
        category: "Terminology",
      },
    ],
  },
  {
    slug: "intrinsic-and-extrinsic",
    title: "Intrinsic value and time value",
    summary: "Every premium is two numbers wearing one price tag.",
    minutes: 9,
    demo: "premium-breakdown",
    visual: "premium-split",
    simple: [
      "**Intrinsic value** is what the option would be worth if it expired right now: max(0, spot − strike) for a call and max(0, strike − spot) for a put. It cannot be negative.",
      "**Extrinsic value** (also called time value) is everything else in the premium. It reflects the possibility that the option becomes more valuable before expiry. Extrinsic value depends on time remaining, implied volatility, distance from strike and interest rates.",
      "At expiry, extrinsic value is zero and the premium equals intrinsic value. Before expiry, buyers pay for possibility — even when intrinsic value is zero.",
    ],
    analogy:
      "A concert ticket has a face value and a 'what if' premium. The face value is intrinsic; the extra you pay on a resale site because the band might become more popular is time value. On the night of the show, the 'what if' disappears and only the face value matters.",
    example: {
      intro:
        "Spot is ₹1,080. A ₹1,000-strike call trades at ₹95 with 20 days left. Break it down.",
      rows: [
        { label: "Call premium", value: "₹95" },
        { label: "Intrinsic value", value: "₹80 (1,080 − 1,000)", tone: "bull" },
        { label: "Extrinsic / time value", value: "₹15 (95 − 80)" },
        { label: "If spot stays ₹1,080 until expiry", value: "Premium = ₹80 at expiry", tone: "bear" },
        { label: "Value lost to time", value: "₹15", tone: "bear" },
      ],
      conclusion:
        "Even though the option is in the money, holding it to expiry with no further move loses the ₹15 time value. Time value is not free — it is a ticking cost for the buyer and income for the seller.",
    },
    mistakes: [
      "Treating the entire premium as intrinsic value when calculating break-even.",
      "Expecting extrinsic value to survive to expiry. It converges to zero.",
      "Assuming high IV increases intrinsic value. It increases extrinsic value, not intrinsic value.",
    ],
    takeaways: [
      "Premium = intrinsic value + extrinsic (time) value.",
      "Intrinsic value is determined by spot vs strike; extrinsic by possibility.",
      "Extrinsic value is maximum at ATM and approaches zero at expiry.",
    ],
    quiz: [
      {
        id: "term-intrinsic-q1",
        question:
          "A put has a ₹600 strike when the underlying is ₹560. The premium is ₹55. What is the extrinsic value?",
        options: ["₹40", "₹55", "₹15", "₹0"],
        correct: 2,
        explanation:
          "Intrinsic value of the put = 600 − 560 = ₹40. Extrinsic value = premium − intrinsic = 55 − 40 = ₹15.",
        difficulty: "Beginner",
        category: "Terminology",
      },
      {
        id: "term-intrinsic-q2",
        question: "At expiration, an option's extrinsic value is:",
        options: ["At its maximum", "Equal to the premium", "Zero", "Negative"],
        correct: 2,
        explanation:
          "With no time remaining, there is no possibility premium left. The option is worth exactly its intrinsic value, which may be zero.",
        difficulty: "Beginner",
        category: "Terminology",
      },
    ],
  },
  {
    slug: "exercise-and-assignment",
    title: "Exercise and assignment",
    summary: "How a right becomes an obligation — and why short options need attention at expiry.",
    minutes: 9,
    demo: "lifecycle",
    visual: "lifecycle",
    simple: [
      "**Exercise** is the buyer using the right in the contract: buying at the strike (call) or selling at the strike (put). **Assignment** is the seller being selected to fulfil that contract.",
      "American-style options can be exercised any time before expiry; European-style options only at expiry. Most US equity options are American, while many index options (including NIFTY) are European. NSE stock options are physically settled, while index options are cash-settled.",
      "If a long option is in the money at expiry, many brokers automatically exercise it unless you instruct otherwise. A short option that is in the money can be assigned, creating a stock position or a cash obligation. Check your broker's policy and expiry schedule.",
    ],
    analogy:
      "Exercise is the ticket holder showing up and claiming the reserved seat. Assignment is the airline being told it must honour that reservation. The airline keeps the booking fee either way — but must deliver the seat.",
    example: {
      intro:
        "You sold a ₹1,000-strike call for ₹40. At expiry the underlying is ₹1,120 and the option is in the money.",
      rows: [
        { label: "Premium received", value: "+₹40" },
        { label: "Assignment obligation", value: "Deliver at ₹1,000" },
        { label: "Market value at expiry", value: "₹1,120" },
        { label: "Intrinsic value owed", value: "−₹120", tone: "bear" },
        { label: "Net result", value: "−₹80 per unit", tone: "bear" },
        { label: "If cash-settled", value: "₹120 debit; no shares change hands" },
      ],
      conclusion:
        "The seller keeps the ₹40 premium but pays the ₹120 intrinsic value. If the position was naked, the loss could have been far larger. Assignment is not a glitch; it is the contract working as designed.",
    },
    mistakes: [
      "Holding an ITM short option into expiry without planning for assignment.",
      "Assuming assignment happens only at expiry. American-style options can be assigned early, especially around dividends.",
      "Forgetting that physically settled stock options can create a large stock position and margin requirement.",
    ],
    takeaways: [
      "Buyers exercise; sellers can be assigned.",
      "European options settle at expiry; American options can be exercised early.",
      "Index options are often cash-settled; stock options are often physically settled. Know your market.",
    ],
    quiz: [
      {
        id: "term-exercise-q1",
        question: "Assignment happens to:",
        options: [
          "The option buyer who exercises",
          "The option seller selected to fulfil the contract",
          "The exchange",
          "Only futures traders",
        ],
        correct: 1,
        explanation:
          "The buyer chooses to exercise. The clearinghouse then assigns the obligation to a seller with a short position in that contract.",
        difficulty: "Beginner",
        category: "Terminology",
      },
      {
        id: "term-exercise-q2",
        question: "NIFTY index options in India are typically:",
        options: [
          "American-style and physically settled",
          "European-style and cash-settled",
          "European-style and physically settled",
          "American-style and cash-settled",
        ],
        correct: 1,
        explanation:
          "NIFTY index options are European-style (exercise only at expiry) and cash-settled. Stock options follow a different convention: NSE stock derivatives are physically settled.",
        difficulty: "Intermediate",
        category: "Terminology",
      },
    ],
  },
];
