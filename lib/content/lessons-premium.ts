import type { LessonSeed } from "@/lib/lessons";

export const premiumLessons: LessonSeed[] = [
  {
    slug: "premium-anatomy",
    title: "Why an option has value",
    summary: "Intrinsic value plus possibility — and the five inputs that move the second part.",
    minutes: 10,
    demo: "premium-breakdown",
    visual: "premium-split",
    simple: [
      "An option premium is the market's price for future possibility. It has two parts: **intrinsic value**, which is what exercise would be worth now, and **extrinsic value**, which is what the market pays for the chance of more.",
      "Extrinsic value rises with more time to expiry, higher implied volatility, and proximity to the strike. It falls as expiry approaches and as volatility collapses. Interest rates and dividends also have a small effect.",
      "A theoretical model such as Black–Scholes combines spot, strike, time, volatility, rates and dividends into a fair value. Real prices deviate because of supply and demand, liquidity, fees and the market's own forecast of volatility.",
    ],
    analogy:
      "An air ticket has a base fare and a change-fee option. The base is intrinsic; the flexibility to change dates is the extra you pay for possibility. As departure approaches, the flexibility is worth less. During a storm, the airline charges more for the same route — volatility.",
    example: {
      intro:
        "Spot is ₹1,000. A 30-day at-the-money call with 20% implied volatility is worth roughly ₹24. Now change one input at a time.",
      rows: [
        { label: "ATM call, 30 days, 20% IV", value: "≈ ₹24 (all extrinsic)" },
        { label: "Same call with 15% IV", value: "≈ ₹18", tone: "bear" },
        { label: "Same call with 30% IV", value: "≈ ₹36", tone: "bull" },
        { label: "Same call with 7 days left", value: "≈ ₹12", tone: "bear" },
        { label: "Spot rises to ₹1,050", value: "≈ ₹62 (₹50 intrinsic + ₹12 time)", tone: "bull" },
        { label: "At expiry, spot ₹1,050", value: "₹50 (intrinsic only)", tone: "neutral" },
      ],
      conclusion:
        "Direction is only one input. A call can lose money while the stock rises if the move is smaller than the time value that evaporates. That is why option traders track IV and time, not just price.",
    },
    mistakes: [
      "Calling an option 'expensive' because its premium is numerically high. Compare it to the underlying and to volatility.",
      "Assuming higher IV increases intrinsic value. It only increases extrinsic value.",
      "Comparing premiums across different expiries or strikes without adjusting for the inputs.",
    ],
    takeaways: [
      "Premium = intrinsic value + extrinsic value.",
      "Time, volatility and moneyness drive extrinsic value.",
      "Theoretical models are reference points, not promises about market prices.",
    ],
    quiz: [
      {
        id: "premium-anatomy-q1",
        question: "Which input increases the extrinsic value of an option, all else equal?",
        options: [
          "Less time to expiry",
          "A lower implied volatility",
          "A higher implied volatility",
          "A lower spot price for a call",
        ],
        correct: 2,
        explanation:
          "Higher implied volatility increases the range of possible outcomes, making the option's possibility premium more valuable. Less time and lower IV reduce it.",
        difficulty: "Intermediate",
        category: "Premium",
      },
      {
        id: "premium-anatomy-q2",
        question: "As an option approaches expiry, its extrinsic value generally:",
        options: [
          "Increases",
          "Stays constant",
          "Falls toward zero",
          "Becomes negative",
        ],
        correct: 2,
        explanation:
          "With less time for the underlying to move, the possibility premium shrinks. At expiry, only intrinsic value remains.",
        difficulty: "Intermediate",
        category: "Premium",
      },
    ],
  },
  {
    slug: "time-decay",
    title: "Time decay (theta)",
    summary: "Why an option is a melting ice cube — and why the last month melts fastest.",
    minutes: 10,
    demo: "theta-decay",
    visual: "theta",
    simple: [
      "Time decay is the loss of extrinsic value as expiry approaches. The Greek that measures it is **theta**, usually quoted as the change in option price per day.",
      "Decay is not linear. An at-the-money option loses value slowly with months to go and much faster in the final weeks. The strike, volatility and moneyness change the pace.",
      "Buyers pay theta every day; sellers collect it. This is why short-dated options can feel 'cheap' but are expensive in probability terms, and why long-dated options cost more even when the strike is the same.",
    ],
    analogy:
      "An ice cube in a warm room. At first it shrinks slowly; near the end it disappears quickly. The option's time value behaves the same way. A 90-day option is not three times as valuable as a 30-day option — the relationship is closer to the square root of time.",
    example: {
      intro:
        "An at-the-money call with spot and strike at ₹1,000, 20% IV, holding everything else constant. Values are approximate theoretical prices.",
      rows: [
        { label: "90 days to expiry", value: "≈ ₹48" },
        { label: "60 days to expiry", value: "≈ ₹38", tone: "bear" },
        { label: "30 days to expiry", value: "≈ ₹24", tone: "bear" },
        { label: "10 days to expiry", value: "≈ ₹14", tone: "bear" },
        { label: "1 day to expiry", value: "≈ ₹4", tone: "bear" },
        { label: "Value lost from 90 → 60 days", value: "≈ ₹10 over 30 days" },
        { label: "Value lost from 10 → 1 day", value: "≈ ₹10 over 9 days", tone: "bear" },
      ],
      conclusion:
        "The same ₹10 of value disappears much faster near expiry. For a buyer, time is a cost that accelerates. For a seller, it is income that accelerates — along with gamma risk.",
    },
    mistakes: [
      "Buying weekly options without a fast, specific catalyst. Theta can erase the thesis.",
      "Assuming theta only matters at the close. It accrues continuously and jumps over weekends/holidays.",
      "Selling short-dated options for small premiums without respecting gamma and tail risk.",
    ],
    takeaways: [
      "Theta measures daily time decay; buyers pay it, sellers earn it.",
      "Decay accelerates near expiry and is highest for ATM options.",
      "Time decay is a cost, not a reason to trade by itself.",
    ],
    quiz: [
      {
        id: "premium-theta-q1",
        question: "Theta is usually negative for:",
        options: [
          "Long options",
          "Short options",
          "Futures contracts",
          "Cash holdings",
        ],
        correct: 0,
        explanation:
          "Long options lose extrinsic value as time passes, so their theta is negative. Short options have positive theta — they benefit from decay.",
        difficulty: "Intermediate",
        category: "Premium",
      },
      {
        id: "premium-theta-q2",
        question: "Time decay for an at-the-money option typically:",
        options: [
          "Is constant every day",
          "Accelerates as expiry approaches",
          "Only occurs on expiry day",
          "Increases when there is more time left",
        ],
        correct: 1,
        explanation:
          "Extrinsic value decays roughly with the square root of time, which means the absolute daily loss accelerates in the final weeks.",
        difficulty: "Intermediate",
        category: "Premium",
      },
    ],
  },
  {
    slug: "volatility-and-premium",
    title: "Volatility and premium",
    summary: "Why the same option costs more before an event than after it.",
    minutes: 9,
    demo: "iv-simulator",
    visual: "iv",
    simple: [
      "Implied volatility (IV) is the market's estimate of how much the underlying is likely to move, expressed as an annualised percentage. It is the main reason two options with the same strike and expiry can have very different prices over time.",
      "Higher IV widens the distribution of possible outcomes, so both calls and puts become more expensive. **Vega** measures the change in premium for a one-percentage-point change in IV.",
      "IV is not a direction. A stock can have high IV and fall, or high IV and rise. Traders distinguish between the direction of the underlying and the price of uncertainty.",
    ],
    analogy:
      "Insurance before hurricane season is expensive even if the weather is calm, because the probability of a severe event is higher. After the storm passes, premiums fall — even if some damage occurred. Option IV behaves like the market's weather premium.",
    example: {
      intro:
        "A 30-day at-the-money call at ₹1,000 with different implied volatilities. Theoretical values; direction and time are unchanged.",
      rows: [
        { label: "IV 10%", value: "≈ ₹12", tone: "bear" },
        { label: "IV 20%", value: "≈ ₹24" },
        { label: "IV 30%", value: "≈ ₹36", tone: "bull" },
        { label: "IV 50%", value: "≈ ₹59", tone: "bull" },
        { label: "Vega near ATM", value: "≈ ₹0.12 per 1% IV for this example" },
      ],
      conclusion:
        "Doubling IV from 15% to 30% can add roughly 50% or more to an ATM option's price. If you buy before an event and IV collapses afterwards, the underlying may move in your favour and the option can still lose value.",
    },
    mistakes: [
      "Buying options solely because IV is high and the news is exciting. High IV means the move is already priced.",
      "Confusing volatility with direction. Volatility is the size of the range, not the sign.",
      "Selling options during a volatility spike without a plan for further expansion.",
    ],
    takeaways: [
      "IV is the market's annualised uncertainty estimate and a key input to premium.",
      "Higher IV raises both call and put prices; vega measures the sensitivity.",
      "IV expansion and contraction can overwhelm a correct directional view.",
    ],
    quiz: [
      {
        id: "premium-vol-q1",
        question: "If implied volatility rises, what typically happens to call and put premiums?",
        options: [
          "Both fall",
          "Calls rise, puts fall",
          "Both rise",
          "Neither changes",
        ],
        correct: 2,
        explanation:
          "Higher uncertainty increases the value of optionality in both directions, so both calls and puts generally become more expensive, all else equal.",
        difficulty: "Intermediate",
        category: "Premium",
      },
      {
        id: "premium-vol-q2",
        question: "Vega measures the change in option price for:",
        options: [
          "A one-day change in time",
          "A one-point change in the underlying",
          "A one-percentage-point change in implied volatility",
          "A one-percentage-point change in interest rates",
        ],
        correct: 2,
        explanation:
          "Vega is the sensitivity to implied volatility, usually expressed per 1% change in IV. Delta is sensitivity to the underlying; theta to time; rho to rates.",
        difficulty: "Intermediate",
        category: "Premium",
      },
    ],
  },
];
