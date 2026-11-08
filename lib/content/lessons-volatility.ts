import type { LessonSeed } from "@/lib/lessons";

export const volatilityLessons: LessonSeed[] = [
  {
    slug: "volatility-basics",
    title: "What volatility really means",
    summary: "Historical versus implied — and how to translate an annualised number into a monthly range.",
    minutes: 10,
    demo: "iv-simulator",
    visual: "iv",
    simple: [
      "Volatility measures how widely a price moves, not which direction it moves. **Historical volatility** is calculated from past returns. **Implied volatility (IV)** is backed out of current option prices and reflects the market's forward-looking estimate.",
      "Volatility is usually annualised. An IV of 20% does not mean '20% tomorrow'; it means roughly a one-standard-deviation move of 20% over a year under the model. Over 30 days, that is about 20% × √(30/365) ≈ 5.7%.",
      "One standard deviation is not a ceiling. Roughly 68% of a normal distribution lies within one standard deviation, so a 30-day 20% IV implies a ±5.7% range about two-thirds of the time — with meaningful probability outside it.",
    ],
    analogy:
      "A weather forecast says 'temperatures will vary by 5°C, but we do not know if it will be warmer or colder than normal.' Volatility is the size of the range, not the direction. IV is the market's forecast of that range, priced into insurance premiums.",
    example: {
      intro:
        "A ₹1,000 stock. Translate annualised IV into an approximate one-standard-deviation move over 30 days.",
      rows: [
        { label: "IV 15%", value: "30-day 1σ ≈ 4.3% → ±₹43" },
        { label: "IV 20%", value: "30-day 1σ ≈ 5.7% → ±₹57" },
        { label: "IV 30%", value: "30-day 1σ ≈ 8.6% → ±₹86" },
        { label: "IV 50%", value: "30-day 1σ ≈ 14.3% → ±₹143" },
        { label: "What 1σ means", value: "≈ 68% of outcomes inside the range, under the model" },
        { label: "What it does not mean", value: "A guaranteed ceiling or a direction forecast" },
      ],
      conclusion:
        "Higher IV means a wider expected range and more expensive options. A stock with 50% IV is not necessarily going up or down — it is simply expected to move more.",
    },
    mistakes: [
      "Assuming high IV means the price will rise. IV describes movement, not direction.",
      "Comparing an annualised IV with a daily move without scaling by √time.",
      "Using past volatility as a guarantee of future volatility. Regimes change quickly.",
    ],
    takeaways: [
      "Volatility is the magnitude of movement; IV is the market's forward estimate.",
      "Annualised IV scales by the square root of time.",
      "One standard deviation is a range, not a promise.",
    ],
    quiz: [
      {
        id: "iv-basics-q1",
        question: "Implied volatility is:",
        options: [
          "A measure of past price movement",
          "The market's forward-looking volatility estimate embedded in option prices",
          "The expected direction of the stock",
          "The option's intrinsic value",
        ],
        correct: 1,
        explanation:
          "IV is derived from option prices and reflects the market's expectation of future movement. Historical volatility is backward-looking; direction is separate.",
        difficulty: "Intermediate",
        category: "Volatility",
      },
      {
        id: "iv-basics-q2",
        question: "A 20% annualised IV over 30 days is roughly what one-standard-deviation move?",
        options: ["20%", "5.7%", "1.7%", "0.2%"],
        correct: 1,
        explanation:
          "Scale annual volatility by √(30/365): 20% × 0.2866 ≈ 5.7%. Over a full year the 1σ move would be about 20%.",
        difficulty: "Intermediate",
        category: "Volatility",
      },
    ],
  },
  {
    slug: "iv-crush",
    title: "IV crush and event risk",
    summary: "Why the stock can move your way and your option still loses money.",
    minutes: 10,
    demo: "iv-simulator",
    visual: "iv",
    simple: [
      "Before a known event — earnings, a budget, an election, a central-bank decision — option prices often rise because uncertainty is high. This is IV expansion.",
      "Once the event is over, the uncertainty is resolved. IV typically falls sharply. That collapse is **IV crush**. A long option can lose value even if the underlying moves in the expected direction, because the vega loss overwhelms the delta gain.",
      "The market's implied move is already embedded in the event premium. To profit as a long-premium buyer, the actual move usually needs to exceed the move the market priced. Traders who sell event premium must still survive the tail outcome.",
    ],
    analogy:
      "Umbrella prices spike the day before a forecast storm. After the storm passes, prices return to normal — even if it did rain. If you bought the umbrella, you paid for the forecast, not for the rain. The seller of umbrellas profited from the fear premium if the storm was milder than expected.",
    example: {
      intro:
        "A ₹1,000 stock has an at-the-money straddle (one call + one put) priced at ₹60 before earnings, with IV at 45%. After earnings, IV falls to 22%. The stock moves 3%.",
      rows: [
        { label: "Before earnings: straddle value", value: "₹60" },
        { label: "Stock moves +3% to ₹1,030", value: "Intrinsic of call ≈ ₹30; put ≈ ₹0" },
        { label: "After IV crush, call value", value: "≈ ₹38 (time value shrinks)" },
        { label: "Long call P&L (bought ₹30)", value: "≈ +₹8 before costs" },
        { label: "Long straddle P&L (paid ₹60)", value: "≈ −₹22", tone: "bear" },
        { label: "Short straddle P&L", value: "≈ +₹22 minus tail risk", tone: "bull" },
      ],
      conclusion:
        "The stock moved, but not enough to beat the event premium. The straddle buyer lost to vega. The straddle seller collected the crush but would have been hurt by a much larger move. Direction alone is an incomplete thesis around events.",
    },
    mistakes: [
      "Buying options just before earnings because 'the stock always moves'.",
      "Forgetting that the market has already priced an implied move.",
      "Selling event premium without a defined-risk structure or a plan for a gap.",
    ],
    takeaways: [
      "IV expands before known events and often collapses after.",
      "Long premium needs a move larger than the implied move to overcome the crush.",
      "Defined-risk spreads can isolate direction while reducing vega exposure.",
    ],
    quiz: [
      {
        id: "iv-crush-q1",
        question: "IV crush most directly hurts:",
        options: [
          "Long option positions",
          "Short option positions",
          "Long stock positions",
          "Cash positions",
        ],
        correct: 0,
        explanation:
          "A fall in implied volatility reduces the value of long options (negative vega impact). Short options benefit from the decline, though their other risks remain.",
        difficulty: "Intermediate",
        category: "Volatility",
      },
      {
        id: "iv-crush-q2",
        question: "A long straddle bought before earnings profits when:",
        options: [
          "The stock moves in either direction, regardless of size",
          "The actual move exceeds the move already priced into the premium",
          "Implied volatility rises after the event",
          "The stock stays exactly at the strike",
        ],
        correct: 1,
        explanation:
          "The straddle has paid for an implied move. It needs the realised move to be larger than that, and ideally a slower IV collapse, to overcome the premium paid.",
        difficulty: "Intermediate",
        category: "Volatility",
      },
    ],
  },
  {
    slug: "trading-iv",
    title: "Trading volatility, not just direction",
    summary: "How IV rank, term structure and event calendars change strategy selection.",
    minutes: 10,
    demo: "iv-simulator",
    visual: "iv",
    simple: [
      "Professional option traders think in two dimensions: direction and volatility. You can be right on direction and lose on volatility, or wrong on direction and still profit from a volatility collapse.",
      "**IV rank** compares current IV with its own range over the past year. High IV rank means options are expensive relative to their own history; low IV rank means they are relatively cheap. It is context, not a timing signal.",
      "Low IV environments tend to favour long-premium structures; high IV environments can favour short-premium structures with defined risk. But IV can always go higher or lower, and events can break historical patterns. Position sizing matters more than the regime label.",
    ],
    analogy:
      "A supermarket shopper checks whether tomatoes are expensive relative to their usual price. Cheap tomatoes might get cheaper; expensive ones might get cheaper too. IV rank is the price tag, not a guarantee about tomorrow's weather.",
    example: {
      intro:
        "Two stocks both trade at ₹1,000. One has an IV rank of 10 (cheap options), the other 90 (expensive options). You are mildly bullish on both.",
      rows: [
        { label: "Stock A: IV rank 10", value: "Long call or debit spread may offer better value" },
        { label: "Stock B: IV rank 90", value: "Buying premium is expensive; consider a credit structure" },
        { label: "Stock B with a bull call spread", value: "Reduces vega versus a naked long call" },
        { label: "Stock A with a short put", value: "Collects little premium for the risk" },
        { label: "Common mistake", value: "Assuming high IV must fall immediately", tone: "bear" },
        { label: "Risk control", value: "Defined risk, small size, and a plan for IV expansion" },
      ],
      conclusion:
        "Volatility context changes which structure is sensible. It does not remove uncertainty. The same bullish view can be expressed with very different vega, theta and gamma by choosing a different structure.",
    },
    mistakes: [
      "Treating high IV rank as a sell signal. Expensive options can become more expensive.",
      "Selling naked options because IV is high, while ignoring the tail risk that caused the high IV.",
      "Forgetting term structure: front-week IV can behave very differently from 6-month IV.",
    ],
    takeaways: [
      "Trade direction and volatility as separate but linked dimensions.",
      "IV rank gives context; it is not a standalone signal.",
      "Structure choice is how you control vega, theta and gamma exposure.",
    ],
    quiz: [
      {
        id: "iv-trading-q1",
        question: "A high IV rank means:",
        options: [
          "The stock is guaranteed to fall",
          "Current IV is high relative to its own recent history",
          "Options are always overpriced and should be sold naked",
          "Historical volatility is zero",
        ],
        correct: 1,
        explanation:
          "IV rank compares current implied volatility with its historical range. It is relative context, not a guarantee of direction or mean reversion.",
        difficulty: "Advanced",
        category: "Volatility",
      },
      {
        id: "iv-trading-q2",
        question: "If you are bullish but want less vega exposure than a naked long call, a suitable structure is:",
        options: [
          "A long straddle",
          "A bull call spread",
          "A naked short put",
          "A short strangle",
        ],
        correct: 1,
        explanation:
          "A bull call spread buys a lower-strike call and sells a higher-strike call, reducing net vega and cost compared with a naked long call, while capping upside.",
        difficulty: "Advanced",
        category: "Volatility",
      },
    ],
  },
];
