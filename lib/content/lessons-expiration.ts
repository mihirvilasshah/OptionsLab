import type { LessonSeed } from "@/lib/lessons";

export const expirationLessons: LessonSeed[] = [
  {
    slug: "option-lifecycle",
    title: "The life of an option",
    summary: "Order, clearing, expiry, exercise, settlement — and where beginners get surprised.",
    minutes: 10,
    demo: "lifecycle",
    visual: "lifecycle",
    simple: [
      "An option begins when you place an order and it is matched on an exchange. The clearing corporation guarantees settlement and tracks open positions. Open interest counts contracts that have not been closed or expired.",
      "As expiry approaches, the option's extrinsic value decays. On expiry, it is either exercised, assigned, or expires worthless. The exchange's settlement mechanism then determines whether cash or shares change hands.",
      "The two big conventions are **exercise style** (American: any time; European: at expiry) and **settlement** (cash or physical delivery). India and the US differ by product, not just by country. Always check the contract specification.",
    ],
    analogy:
      "A concert ticket has a sale window, an entry time and a post-concert outcome. You can resell it before the show, use it at the gate, or let it expire. The venue's rules decide whether a ticket is refundable, transferable or invalid after the doors close. Options have their own rulebook.",
    example: {
      intro:
        "A hypothetical NIFTY weekly option bought on Monday, with expiry on Thursday. The contract is European and cash-settled.",
      rows: [
        { label: "Monday 10:15", value: "Buy 1 lot of 25,000 CE at ₹120" },
        { label: "Premium paid", value: "₹120 × 75 = ₹9,000" },
        { label: "Wednesday close", value: "NIFTY at 25,180; premium ₹210" },
        { label: "Unrealised gain", value: "₹90 × 75 = ₹6,750", tone: "bull" },
        { label: "Thursday expiry", value: "NIFTY settles at 25,240" },
        { label: "Intrinsic value", value: "₹240 × 75 = ₹18,000", tone: "bull" },
        { label: "Net P&L if held", value: "₹18,000 − ₹9,000 = +₹9,000", tone: "bull" },
      ],
      conclusion:
        "If the index had settled below 25,000, the option would expire worthless and the ₹9,000 premium would be lost. For a cash-settled index option, no shares are delivered — the profit or loss is credited or debited.",
    },
    mistakes: [
      "Forgetting the exact expiry cutoff time. An option can still trade on expiry day, but the settlement price is determined by the exchange's rules.",
      "Assuming your broker will automatically square off a position before expiry. Auto-square-off policies vary and may incur charges.",
      "Holding a physically settled short option into expiry without the shares or cash to settle.",
    ],
    takeaways: [
      "Options pass through order, clearing, expiry and settlement.",
      "Exercise style and settlement method are contract-specific.",
      "Know your broker's expiry and auto-exercise policies before the final day.",
    ],
    quiz: [
      {
        id: "expiry-lifecycle-q1",
        question: "Open interest measures:",
        options: [
          "The total premium paid today",
          "Contracts that remain open and unsettled",
          "The number of shares a company has issued",
          "The exchange's margin balance",
        ],
        correct: 1,
        explanation:
          "Open interest is the number of outstanding option contracts that have not been closed, exercised or expired. It is not trading volume, which counts contracts traded during a period.",
        difficulty: "Intermediate",
        category: "Expiration",
      },
      {
        id: "expiry-lifecycle-q2",
        question: "A European-style option can be exercised:",
        options: [
          "Any trading day before expiry",
          "Only at expiry",
          "Only on Mondays",
          "Only if it is in the money by more than 10%",
        ],
        correct: 1,
        explanation:
          "European-style options can be exercised only at expiry. American-style options can be exercised any time before expiry. NIFTY index options are European.",
        difficulty: "Intermediate",
        category: "Expiration",
      },
    ],
  },
  {
    slug: "expiration-day",
    title: "Expiration-day behaviour",
    summary: "Gamma, pin risk and why the last day is not like the others.",
    minutes: 9,
    demo: "theta-decay",
    visual: "theta",
    simple: [
      "On expiry day, extrinsic value is almost gone. An at-the-money option can behave like a binary bet: small moves in the underlying create large percentage changes in the option price.",
      "Gamma is extremely high near the strike. A short option position can see its delta swing violently, forcing hedges at the worst time. This is **pin risk** — the underlying hovering near a strike where many contracts are open.",
      "Liquidity can thin out and bid-ask spreads can widen. If you do not intend to take or deliver the underlying, closing the position before the final session is usually safer than hoping for a last-minute move.",
    ],
    analogy:
      "The last minute of an auction. Most bidders have gone home, the remaining bids jump around, and a single bid can change the price dramatically. Expiry day is the last minute of an option's life — exciting, but a poor place for careless size.",
    example: {
      intro:
        "It is expiry morning. NIFTY is at 25,000 and the 25,000-strike call trades at ₹6 with a few hours left. One lot is 75 units.",
      rows: [
        { label: "Option price", value: "₹6 × 75 = ₹450" },
        { label: "NIFTY finishes at 25,000", value: "Total loss of ₹450", tone: "bear" },
        { label: "NIFTY finishes at 25,020", value: "Intrinsic 20 × 75 = ₹1,500 → +₹1,050", tone: "bull" },
        { label: "NIFTY finishes at 24,980", value: "Total loss of ₹450", tone: "bear" },
        { label: "Premium as % of strike", value: "0.024% — a tiny move decides everything" },
        { label: "Short position gamma", value: "Delta can swing from near 0 to near 1", tone: "bear" },
      ],
      conclusion:
        "A 20-point move — 0.08% — turns a total loss into a 233% gain. That is not a stable edge; it is a high-variance bet. Sellers face the mirror image, with gamma risk that can force losses far larger than the premium collected.",
    },
    mistakes: [
      "Buying far OTM options on expiry day because they are 'almost free'. They usually expire worthless.",
      "Selling 0DTE options without understanding gamma and assignment risk.",
      "Holding a short ITM option into the close and being assigned shares you did not plan for.",
    ],
    takeaways: [
      "Expiry day is dominated by gamma and pin risk.",
      "Small underlying moves create huge percentage swings in near-ATM options.",
      "If you do not want the underlying, manage or close the position before expiry.",
    ],
    quiz: [
      {
        id: "expiry-day-q1",
        question: "Pin risk refers to:",
        options: [
          "The risk that an option's price is pinned by the exchange",
          "The uncertainty when the underlying finishes near a heavily traded strike at expiry",
          "A guaranteed assignment profit",
          "The inability to buy options on expiry day",
        ],
        correct: 1,
        explanation:
          "When the underlying hovers near a strike with large open interest, it is unclear how many options will be exercised and who will be assigned. That uncertainty is pin risk.",
        difficulty: "Advanced",
        category: "Expiration",
      },
      {
        id: "expiry-day-q2",
        question: "Near expiry, an at-the-money option's gamma is typically:",
        options: ["Very low", "Very high", "Zero", "Negative for long options"],
        correct: 1,
        explanation:
          "ATM gamma rises sharply as expiry approaches because delta can swing quickly between 0 and 1 on small underlying moves.",
        difficulty: "Advanced",
        category: "Expiration",
      },
    ],
  },
  {
    slug: "settlement-india-vs-us",
    title: "Settlement: India vs the US",
    summary: "Cash or shares? European or American? The rules that decide what happens at expiry.",
    minutes: 11,
    demo: "lifecycle",
    visual: "lifecycle",
    simple: [
      "In India, NIFTY, BANKNIFTY and FINNIFTY index options are European-style and cash-settled. SENSEX options follow BSE rules. NSE **stock** options are physically settled, so an ITM option can create a delivery obligation in the underlying shares.",
      "In the US, most single-stock and ETF options are American-style and physically settled: one standard contract controls 100 shares. Broad index options such as SPX are typically European-style and cash-settled. Some index products have AM or PM settlement on the final day.",
      "Early exercise and dividends matter for American-style options. A deep ITM call may be exercised just before an ex-dividend date, and a short position can be assigned early. European-style index options avoid that but still have expiry-day settlement risk.",
    ],
    analogy:
      "Two countries, two delivery services. In one, the package is delivered to your door (physical settlement). In the other, the value is transferred electronically (cash settlement). The contract tells you which service applies — assuming can be expensive.",
    example: {
      intro:
        "You are short one in-the-money call into expiry. Compare an Indian index contract with an Indian stock contract and a US equity option.",
      rows: [
        { label: "NIFTY 25,000 CE (short)", value: "Cash-settled: debit the intrinsic value", tone: "neutral" },
        { label: "Reliance 1,450 CE (short)", value: "Physically settled: deliver 500 shares", tone: "bear" },
        { label: "AAPL $230 call (short, 1 contract)", value: "Physically settled: deliver 100 shares", tone: "bear" },
        { label: "SPX index option (short)", value: "European, cash-settled", tone: "neutral" },
        { label: "Early assignment", value: "Possible on American-style options, e.g. before dividends" },
        { label: "Settlement risk", value: "Shares or cash must be available by the settlement date" },
      ],
      conclusion:
        "The same 'short call' label can mean a cash debit, a 500-share delivery, or a 100-share delivery. Read the contract specification and understand your broker's margin and settlement process before expiry week.",
    },
    mistakes: [
      "Assuming every index option is cash-settled. Product rules differ by exchange and underlying.",
      "Forgetting that Indian stock options are physically settled and can create large delivery obligations.",
      "Ignoring early-assignment risk on American-style options around dividends.",
    ],
    takeaways: [
      "India: index options are typically European and cash-settled; stock options are physically settled.",
      "US: equity/ETF options are typically American and physically settled; major index options are often European and cash-settled.",
      "Settlement method changes the capital and operational risk of holding into expiry.",
    ],
    quiz: [
      {
        id: "expiry-settle-q1",
        question: "NSE stock options in India are generally:",
        options: [
          "European-style and cash-settled",
          "American-style and cash-settled",
          "Physically settled",
          "Settled only in US dollars",
        ],
        correct: 2,
        explanation:
          "NSE stock derivatives are physically settled. An in-the-money option exercised or assigned results in delivery of the underlying shares, which requires sufficient margin and shares/cash.",
        difficulty: "Advanced",
        category: "Expiration",
      },
      {
        id: "expiry-settle-q2",
        question: "Early exercise is generally possible for:",
        options: [
          "European-style options",
          "American-style options",
          "Only cash-settled options",
          "Only index options",
        ],
        correct: 1,
        explanation:
          "American-style options can be exercised any time before expiry. European-style options can only be exercised at expiry. Most US single-stock options are American-style.",
        difficulty: "Advanced",
        category: "Expiration",
      },
    ],
  },
];
