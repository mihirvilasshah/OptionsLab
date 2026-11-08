import { ALL_LESSONS, type QuizQuestion } from "@/lib/lessons";

export const LESSON_QUESTIONS: (QuizQuestion & { source: string; moduleSlug: string })[] =
  ALL_LESSONS.flatMap((lesson) =>
    lesson.quiz.map((question) => ({
      ...question,
      source: lesson.title,
      moduleSlug: lesson.moduleSlug,
    })),
  );

export const EXTRA_QUESTIONS: QuizQuestion[] = [
  {
    id: "extra-pnl-1",
    question:
      "You buy a ₹1,000-strike call for ₹50. At expiry the stock is ₹1,120. What is the profit per unit?",
    options: ["₹120", "₹70", "₹50", "₹20"],
    correct: 1,
    explanation:
      "Intrinsic value = 1,120 − 1,000 = ₹120. Subtract the ₹50 premium: ₹70 profit. The ₹120 payoff alone overstates the result.",
    difficulty: "Beginner",
    category: "P&L",
  },
  {
    id: "extra-strategy-1",
    question:
      "You are moderately bullish, want defined risk, and are unwilling to pay the full cost of an ATM call. Which structure fits best?",
    options: ["Long straddle", "Bull call spread", "Short strangle", "Long put"],
    correct: 1,
    explanation:
      "A bull call spread buys a lower-strike call and sells a higher-strike call. It reduces cost and vega versus a naked call, with both profit and loss defined.",
    difficulty: "Intermediate",
    category: "Strategy selection",
  },
  {
    id: "extra-iv-1",
    question:
      "A stock moves 3% higher after earnings, but your long call loses money. Which explanation is most plausible?",
    options: [
      "Delta was negative",
      "Implied volatility collapsed after the event",
      "The strike was below spot",
      "Interest rates rose",
    ],
    correct: 1,
    explanation:
      "IV crush after an event can reduce the option's value more than the delta gain from a modest move. This is classic negative-vega pain for long-premium event trades.",
    difficulty: "Intermediate",
    category: "Volatility",
  },
  {
    id: "extra-greeks-1",
    question: "Which Greek is highest for an at-the-money option in its final hours?",
    options: ["Gamma", "Rho", "Vega", "Dividend yield"],
    correct: 0,
    explanation:
      "Near expiry, an ATM option's delta can swing rapidly between 0 and 1, so gamma is extremely high. Vega and rho are close to zero with little time left.",
    difficulty: "Advanced",
    category: "Greeks",
  },
  {
    id: "extra-put-be",
    question: "You buy a ₹900-strike put for ₹30. What is the break-even at expiry?",
    options: ["₹930", "₹900", "₹870", "₹830"],
    correct: 2,
    explanation:
      "For a long put, break-even = strike − premium = 900 − 30 = ₹870. The underlying must fall below ₹870 for a profit at expiry.",
    difficulty: "Beginner",
    category: "P&L",
  },
  {
    id: "extra-condor",
    question: "The primary market outlook for an iron condor is:",
    options: [
      "A large move in either direction",
      "A strong bullish trend",
      "A range-bound market",
      "A sharp volatility spike",
    ],
    correct: 2,
    explanation:
      "An iron condor collects premium from both sides and profits if the underlying finishes between the short strikes, so it suits a range-bound view with defined risk.",
    difficulty: "Intermediate",
    category: "Strategy selection",
  },
  {
    id: "extra-naked-risk",
    question: "What is the maximum loss on a naked short call?",
    options: [
      "The premium received",
      "The strike price",
      "Unlimited",
      "The difference between strike and premium",
    ],
    correct: 2,
    explanation:
      "There is no theoretical ceiling on the underlying, so a naked short call can lose an unlimited amount. A long higher-strike call would define the risk.",
    difficulty: "Beginner",
    category: "Risk",
  },
  {
    id: "extra-covered",
    question: "A covered call primarily:",
    options: [
      "Removes all downside risk on the stock",
      "Generates income in exchange for capping upside",
      "Guarantees a profit if the stock falls",
      "Has unlimited profit potential",
    ],
    correct: 1,
    explanation:
      "The call premium adds income, but the short call caps gains above the strike. The stock still carries full downside risk.",
    difficulty: "Beginner",
    category: "Strategy selection",
  },
  {
    id: "extra-theta",
    question: "Which position has positive theta?",
    options: ["Long call", "Long put", "Long straddle", "Short iron condor"],
    correct: 3,
    explanation:
      "The iron condor is net short options, so it collects time decay (positive theta). Long options and long straddles pay theta.",
    difficulty: "Intermediate",
    category: "Greeks",
  },
  {
    id: "extra-vega",
    question: "A long call position is most likely to benefit from:",
    options: [
      "Falling implied volatility",
      "Rising implied volatility",
      "Time passing with no move",
      "A fall in the underlying",
    ],
    correct: 1,
    explanation:
      "Long options are vega-positive. Rising IV increases the value of the option, even before any move in the underlying.",
    difficulty: "Intermediate",
    category: "Greeks",
  },
  {
    id: "extra-sizing",
    question:
      "Capital is ₹5,00,000. You risk 1% per trade, buy at ₹100 with a stop at ₹90, and the lot size is 1. What is the maximum position size?",
    options: ["500 units", "5,000 units", "50 units", "5,00,000 units"],
    correct: 0,
    explanation:
      "Risk budget = 5,00,000 × 1% = ₹5,000. Risk per unit = 100 − 90 = ₹10. Maximum units = 5,000 / 10 = 500.",
    difficulty: "Intermediate",
    category: "Risk",
  },
  {
    id: "extra-position-delta",
    question:
      "You own 3 NIFTY call lots (lot size 75), each with delta 0.40. What is the approximate position delta in index units?",
    options: ["40", "90", "120", "225"],
    correct: 1,
    explanation:
      "Position delta = delta × contracts × lot size = 0.40 × 3 × 75 = 90. The position behaves like 90 units of the index for small moves.",
    difficulty: "Advanced",
    category: "Greeks",
  },
  {
    id: "extra-intrinsic",
    question:
      "A put has a ₹1,200 strike and the underlying is ₹1,120. The premium is ₹95. What is the extrinsic value?",
    options: ["₹15", "₹80", "₹95", "₹0"],
    correct: 0,
    explanation:
      "Intrinsic = 1,200 − 1,120 = ₹80. Extrinsic = 95 − 80 = ₹15. The option is in the money, but most of the premium is intrinsic.",
    difficulty: "Intermediate",
    category: "Pricing",
  },
  {
    id: "extra-settlement",
    question: "An in-the-money short NSE stock option held into expiry can result in:",
    options: [
      "Automatic cash settlement only",
      "A physical delivery obligation in the shares",
      "Conversion into a futures contract",
      "No obligation because the seller chose the contract",
    ],
    correct: 1,
    explanation:
      "NSE stock derivatives are physically settled. The seller may need to deliver shares (short call) or take delivery (short put), with margin and capital implications.",
    difficulty: "Advanced",
    category: "Expiration",
  },
  {
    id: "extra-calendar",
    question: "A calendar spread primarily tries to exploit:",
    options: [
      "A large directional move",
      "Differences in time decay and volatility across expiries",
      "Dividend payments",
      "Interest-rate convergence",
    ],
    correct: 1,
    explanation:
      "A calendar sells a shorter-dated option and buys a longer-dated option at the same strike, aiming to benefit from faster near-term decay and term-structure changes.",
    difficulty: "Advanced",
    category: "Strategy selection",
  },
  {
    id: "extra-ratio-risk",
    question: "The main danger of a 1:2 call ratio spread is:",
    options: [
      "Limited profit if the stock falls",
      "Unlimited loss above the short strikes because only one long call offsets two shorts",
      "Assignment only at expiry",
      "Negative theta",
    ],
    correct: 1,
    explanation:
      "The extra short call is uncovered. Above the short strike, the position loses more than the long call gains, creating an undefined-risk tail unless additional calls are bought.",
    difficulty: "Advanced",
    category: "Risk",
  },
  {
    id: "extra-early-assignment",
    question: "Early assignment on a short call is most likely when:",
    options: [
      "The call is far out of the money",
      "The call is deep in the money and a dividend is about to be paid",
      "Implied volatility is low",
      "The option is European-style",
    ],
    correct: 1,
    explanation:
      "A deep ITM American call may be exercised just before the ex-dividend date to capture the dividend. European-style options cannot be exercised early.",
    difficulty: "Advanced",
    category: "Expiration",
  },
  {
    id: "extra-probability",
    question: "A strategy with a 90% probability of profit can still be dangerous because:",
    options: [
      "Probability of profit is always wrong",
      "The 10% losing outcomes can be much larger than the frequent small wins",
      "Theta is always negative",
      "It must involve naked options",
    ],
    correct: 1,
    explanation:
      "High-probability strategies often have small gains and large losses. Expectancy depends on both the probability and the size of each outcome, not just the win rate.",
    difficulty: "Intermediate",
    category: "Risk",
  },
  {
    id: "extra-protective-put",
    question: "A protective put on a stock position:",
    options: [
      "Raises the maximum possible loss",
      "Creates a downside floor at the cost of premium",
      "Is the same as selling a call",
      "Eliminates time decay",
    ],
    correct: 1,
    explanation:
      "The put gains value as the stock falls, offsetting losses below the strike. The premium is a cost, and upside is reduced by that cost.",
    difficulty: "Beginner",
    category: "Strategy selection",
  },
  {
    id: "extra-breakeven-credit",
    question:
      "A bull put spread sells the ₹950 put for ₹10 and buys the ₹900 put for ₹4. What is the break-even at expiry?",
    options: ["₹944", "₹956", "₹950", "₹940"],
    correct: 0,
    explanation:
      "Net credit = 10 − 4 = ₹6. For a short put spread, break-even = short strike − net credit = 950 − 6 = ₹944.",
    difficulty: "Advanced",
    category: "P&L",
  },
  {
    id: "extra-time-decay",
    question: "Which option loses the most value per day, all else equal, with one week left?",
    options: [
      "Deep ITM call with delta 0.95",
      "ATM call",
      "Far OTM call",
      "A call with two years to expiry",
    ],
    correct: 1,
    explanation:
      "Theta is highest for at-the-money options near expiry because their extrinsic value is largest relative to remaining time. Deep ITM options are mostly intrinsic; far OTM options have little premium left.",
    difficulty: "Intermediate",
    category: "Greeks",
  },
];

export const QUIZ_BANK: QuizQuestion[] = [
  ...LESSON_QUESTIONS.map(({ source: _source, moduleSlug: _moduleSlug, ...question }) => question),
  ...EXTRA_QUESTIONS,
];

export const QUIZ_CATEGORIES = Array.from(new Set(QUIZ_BANK.map((question) => question.category))).sort();

export const DIFFICULTIES: QuizQuestion["difficulty"][] = ["Beginner", "Intermediate", "Advanced"];

export interface DailyChallenge {
  id: string;
  title: string;
  scenario: string;
  question: QuizQuestion;
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "daily-1",
    title: "The event trap",
    scenario:
      "A stock trades at ₹1,000. Before earnings, the 1,000-strike straddle costs ₹70. You buy it, expecting a big move. The stock finishes at ₹1,045, a 4.5% move.",
    question: {
      id: "daily-q-1",
      question: "What is the most likely outcome at expiry?",
      options: [
        "A profit because the stock moved",
        "A loss because the move was below the implied move and time value decayed",
        "A guaranteed break-even",
        "Unlimited profit because the straddle has two legs",
      ],
      correct: 1,
      explanation:
        "The straddle needed a move beyond roughly ±₹70 to break even (ignoring IV changes). A ₹45 move leaves the call worth ₹45 and the put ₹0, so the ₹70 cost is not recovered. If IV collapsed after earnings, the mark-to-market loss would be even larger before expiry.",
      difficulty: "Intermediate",
      category: "Volatility",
    },
  },
  {
    id: "daily-2",
    title: "The free-looking short",
    scenario:
      "A trader sells one naked NIFTY call for ₹2,000 of premium, believing a rally is unlikely. The index then rallies 8% over two sessions.",
    question: {
      id: "daily-q-2",
      question: "Which risk is the trader facing?",
      options: [
        "Loss limited to the ₹2,000 premium",
        "A margin call and potentially very large losses",
        "No risk because the option was sold, not bought",
        "Only the bid-ask spread",
      ],
      correct: 1,
      explanation:
        "A naked short call has undefined risk. A sharp rally can produce losses far larger than the premium, and the broker may issue a margin call or force a buyback. The premium is compensation for this risk, not a safety net.",
      difficulty: "Beginner",
      category: "Risk",
    },
  },
  {
    id: "daily-3",
    title: "Right direction, wrong Greek",
    scenario:
      "You buy a 30-day ATM call at 45% IV before an event. The stock rises 2% after the event and IV falls to 20%.",
    question: {
      id: "daily-q-3",
      question: "Why might the call still lose money?",
      options: [
        "Delta turned negative",
        "The vega loss from the IV collapse outweighed the delta gain",
        "The option became European",
        "Theta was positive",
      ],
      correct: 1,
      explanation:
        "Long options are vega-positive. A 25-point IV collapse can reduce the option's value by more than a 2% move adds through delta. This is the classic post-event IV crush.",
      difficulty: "Intermediate",
      category: "Volatility",
    },
  },
  {
    id: "daily-4",
    title: "The covered-call regret",
    scenario:
      "You own Reliance at ₹1,400 and sell the ₹1,450 call for ₹20. Reliance jumps to ₹1,600 before expiry.",
    question: {
      id: "daily-q-4",
      question: "What is your approximate outcome per share compared with simply holding the stock?",
      options: [
        "You keep all the upside plus the premium",
        "Your gain is capped near ₹70 per share, so you forgo about ₹130 of additional upside",
        "You lose money because the stock rose",
        "You are assigned at ₹1,400 and keep the full ₹200 gain",
      ],
      correct: 1,
      explanation:
        "You gain ₹50 of stock appreciation up to ₹1,450 plus ₹20 of premium, about ₹70. The stock rising to ₹1,600 means you forgo ₹150 of additional upside (less the premium received). That is the trade-off for income.",
      difficulty: "Beginner",
      category: "Strategy selection",
    },
  },
  {
    id: "daily-5",
    title: "The sizing test",
    scenario:
      "Your account is ₹10,00,000. You want to risk no more than 0.5% on an option trade. The premium is ₹40 per unit and your planned exit if wrong is ₹24.",
    question: {
      id: "daily-q-5",
      question: "What is the maximum number of units you should buy (ignoring lot-size rounding)?",
      options: ["312 units", "125 units", "625 units", "1,250 units"],
      correct: 0,
      explanation:
        "Risk budget = 10,00,000 × 0.5% = ₹5,000. Risk per unit = 40 − 24 = ₹16. Maximum units = 5,000 / 16 = 312.5, so 312 units before lot-size rounding. Buying 1,250 units would risk ₹20,000, four times the intended budget.",
      difficulty: "Advanced",
      category: "Risk",
    },
  },
  {
    id: "daily-6",
    title: "The expiry gamble",
    scenario:
      "On expiry afternoon, NIFTY is at 25,000. A 25,000-strike call trades at ₹8 with two hours left. You buy one lot of 75.",
    question: {
      id: "daily-q-6",
      question: "What is the approximate payoff if NIFTY settles at 25,012?",
      options: [
        "−₹600",
        "+₹300",
        "+₹900",
        "−₹8",
      ],
      correct: 1,
      explanation:
        "Intrinsic = 12 points × 75 = ₹900. Premium paid = 8 × 75 = ₹600. Net profit = ₹300. A 12-point move determines a 50% return on premium; this is expiry gamma, not a stable edge.",
      difficulty: "Advanced",
      category: "P&L",
    },
  },
  {
    id: "daily-7",
    title: "The iron condor",
    scenario:
      "NIFTY is at 25,000. You sell the 24,500 put and 25,500 call, and buy the 24,000 put and 26,000 call for a net credit of ₹60 per unit.",
    question: {
      id: "daily-q-7",
      question: "Where does the strategy make its maximum profit?",
      options: [
        "If NIFTY finishes below 24,000",
        "If NIFTY finishes above 26,000",
        "If NIFTY finishes between 24,500 and 25,500",
        "Only if NIFTY finishes exactly at 25,000",
      ],
      correct: 2,
      explanation:
        "All short options expire worthless if the index finishes between the short strikes, so the full credit is kept. Beyond either short strike, profit declines; beyond the long wings, the maximum loss is reached.",
      difficulty: "Intermediate",
      category: "Strategy selection",
    },
  },
  {
    id: "daily-8",
    title: "The delta question",
    scenario:
      "You hold 4 lots of a call with delta 0.35. The lot size is 75. The index rises 20 points.",
    question: {
      id: "daily-q-8",
      question: "What is the approximate change in the position's value from delta alone?",
      options: ["₹280", "₹1,050", "₹2,100", "₹7,000"],
      correct: 2,
      explanation:
        "Position delta = 0.35 × 4 × 75 = 105. A 20-point move × 105 = ₹2,100. Gamma would change delta during the move, so this is a first-order estimate.",
      difficulty: "Advanced",
      category: "Greeks",
    },
  },
  {
    id: "daily-9",
    title: "The assignment surprise",
    scenario:
      "You sold one ₹1,450-strike call on Reliance (lot size 500) into expiry. Reliance settles at ₹1,500.",
    question: {
      id: "daily-q-9",
      question: "What is the most likely operational outcome in India?",
      options: [
        "A cash credit of ₹25,000 with no shares involved",
        "An obligation to deliver 500 Reliance shares at ₹1,450",
        "The option automatically rolls to the next month",
        "No action because the option was sold",
      ],
      correct: 1,
      explanation:
        "NSE stock options are physically settled. The short call can be assigned, requiring delivery of 500 shares at the strike. You would need the shares or equivalent arrangements. The intrinsic loss is 50 × 500 = ₹25,000, offset by the premium received.",
      difficulty: "Advanced",
      category: "Expiration",
    },
  },
  {
    id: "daily-10",
    title: "The break-even reality",
    scenario:
      "You buy a ₹1,000-strike put for ₹45 because you expect a 3% decline over the next month. Spot is ₹1,000.",
    question: {
      id: "daily-q-10",
      question: "What does the break-even imply about your view?",
      options: [
        "A 3% decline is more than enough to profit",
        "You need a decline larger than 4.5% just to break even at expiry",
        "The put profits if the stock stays flat",
        "Break-even is irrelevant for puts",
      ],
      correct: 1,
      explanation:
        "Break-even = 1,000 − 45 = ₹955, a 4.5% decline. A 3% decline to ₹970 leaves ₹30 intrinsic versus ₹45 paid, a loss of ₹15. The size of the expected move must exceed the premium hurdle.",
      difficulty: "Intermediate",
      category: "P&L",
    },
  },
];

export function getDailyChallenge(date = new Date()): DailyChallenge {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return DAILY_CHALLENGES[hash % DAILY_CHALLENGES.length];
}

export function getQuizPool({
  difficulty = "All",
  category = "All",
}: {
  difficulty?: QuizQuestion["difficulty"] | "All";
  category?: string | "All";
} = {}) {
  return QUIZ_BANK.filter(
    (question) =>
      (difficulty === "All" || question.difficulty === difficulty) &&
      (category === "All" || question.category === category),
  );
}

export function shuffleQuestions<T>(items: T[], seed: number) {
  const copy = [...items];
  let value = seed || 1;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    value = (value * 1664525 + 1013904223) % 4294967296;
    const swap = value % (index + 1);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export const QUIZ_STATS = {
  totalQuestions: QUIZ_BANK.length,
  lessonQuestions: LESSON_QUESTIONS.length,
  scenarioQuestions: EXTRA_QUESTIONS.length,
  dailyChallenges: DAILY_CHALLENGES.length,
};
