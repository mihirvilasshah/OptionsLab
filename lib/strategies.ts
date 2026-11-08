import {
  analyzePayoff,
  blackScholes,
  estimateProbability,
  netPremium as computeNetPremium,
  type OptionLeg,
} from "@/lib/options";

export type StrategyLevel = "Beginner" | "Intermediate" | "Advanced";
export type MarketOutlook = "Bullish" | "Bearish" | "Neutral" | "Range-bound" | "Volatile";

export interface StrategyLegSpec {
  action: "buy" | "sell";
  type: "call" | "put" | "stock";
  /** Strike offset from spot, e.g. 0.05 = 5% above spot. */
  offset: number;
  qty: number;
  /** Optional separate expiry in days for calendars and diagonals. */
  expiryDays?: number;
  label: string;
}

export interface OptionsStrategy {
  slug: string;
  name: string;
  level: StrategyLevel;
  outlook: MarketOutlook;
  tagline: string;
  what: string;
  when: string;
  structure: "Debit" | "Credit" | "Variable";
  risk: "Defined" | "Undefined";
  capital: string;
  example: string;
  mistakes: string[];
  fails: string[];
  tip: string;
  related: string[];
  tags: string[];
  legs: StrategyLegSpec[];
  probabilityEligible?: boolean;
}

export const DEFAULT_SPOT = 1000;
export const DEFAULT_IV = 0.2;
export const DEFAULT_RATE = 0.065;

export const STRATEGIES: OptionsStrategy[] = [
  {
    slug: "long-call",
    name: "Long Call",
    level: "Beginner",
    outlook: "Bullish",
    tagline: "Limited risk, uncapped upside if the underlying rallies.",
    what:
      "Buy a call option for the right to purchase the underlying at the strike. You pay a premium; your maximum loss is that premium, while upside remains open-ended.",
    when:
      "You expect a meaningful move above strike + premium before expiry, ideally with a catalyst and with implied volatility that is not already extreme.",
    structure: "Debit",
    risk: "Defined",
    capital: "Net premium paid. One NIFTY lot can turn a ₹24 premium into ₹1,800 of capital (24 × 75).",
    example:
      "Spot ₹1,000. Buy the 1,000-strike call for about ₹24 with 30 days left. Break-even is ₹1,024. At ₹1,100 the intrinsic value is ₹100, a ₹76 gain per unit before costs.",
    mistakes: [
      "Buying far out-of-the-money calls because they look cheap, then needing an unrealistic move.",
      "Ignoring time decay and implied volatility. Direction alone is not enough.",
      "Sizing the position so large that a total premium loss damages the account.",
    ],
    fails: [
      "The stock grinds higher too slowly and theta eats the premium.",
      "The stock rallies after the option expires.",
      "IV collapses even though the stock moves in your favour.",
    ],
    tip: "Write down the target price and date before entering. If the target is below break-even, the trade does not match your view.",
    related: ["bull-call-spread", "long-straddle"],
    tags: ["directional", "long premium", "defined risk"],
    legs: [{ action: "buy", type: "call", offset: 0, qty: 1, label: "Buy ATM call" }],
  },
  {
    slug: "long-put",
    name: "Long Put",
    level: "Beginner",
    outlook: "Bearish",
    tagline: "Profit from a decline — or insure a stock holding.",
    what:
      "Buy a put option for the right to sell the underlying at the strike. Maximum loss is the premium; maximum profit is large but capped because the underlying cannot fall below zero.",
    when:
      "You expect a decline below strike − premium before expiry, or you want defined protection for a concentrated long position over a specific horizon.",
    structure: "Debit",
    risk: "Defined",
    capital: "Net premium paid. Protection has an ongoing cost if renewed repeatedly.",
    example:
      "Spot ₹1,000. Buy the 1,000-strike put for about ₹23 with 30 days left. Break-even is ₹977. At ₹900 the intrinsic value is ₹100, a ₹77 gain per unit before costs.",
    mistakes: [
      "Buying puts after a sharp fall when implied volatility and the premium are already elevated.",
      "Hedging a tiny position with an expensive put and letting costs exceed the benefit.",
      "Forgetting that the protection expires and must be renewed.",
    ],
    fails: [
      "The stock falls slowly and theta erodes the put before the target is reached.",
      "The stock stays flat. The put loses time value even without a rally.",
      "IV crush after an event removes the fear premium.",
    ],
    tip: "A put is insurance or a bearish bet. Decide which one before choosing the strike and expiry.",
    related: ["bear-put-spread", "long-strangle"],
    tags: ["directional", "hedging", "long premium"],
    legs: [{ action: "buy", type: "put", offset: 0, qty: 1, label: "Buy ATM put" }],
  },
  {
    slug: "covered-call",
    name: "Covered Call",
    level: "Beginner",
    outlook: "Neutral",
    tagline: "Own the stock, rent it out for premium, cap the upside.",
    what:
      "Own the underlying and sell a call against it. The premium adds income, but if the stock rallies above the strike, the shares are called away and upside is capped.",
    when:
      "You own the stock, are neutral-to-moderately bullish, and are willing to sell at the strike in exchange for income.",
    structure: "Credit",
    risk: "Defined",
    capital: "Cost of owning the shares (minus premium received). The stock itself retains full downside risk.",
    example:
      "Own stock at ₹1,000 and sell the 1,050-strike call for about ₹12. You keep ₹12 if the stock finishes below ₹1,050. Above ₹1,050 your gain is capped at ₹62 per share (₹50 appreciation + ₹12 premium).",
    mistakes: [
      "Selling calls on stock you do not actually want to sell at the strike.",
      "Calling the strategy 'safe' because it is covered. The stock can still fall sharply.",
      "Selling very short-dated calls for tiny premiums and missing a large rally.",
    ],
    fails: [
      "The stock falls. The premium cushions only a small part of the loss.",
      "The stock rallies far above the strike and you underperform simply holding.",
      "Early assignment before a dividend if the call is deep in the money.",
    ],
    tip: "Choose the strike based on the price at which you would genuinely be happy to sell, not just the premium offered.",
    related: ["cash-secured-put", "diagonal-spread"],
    tags: ["income", "stock overlay", "covered"],
    legs: [
      { action: "buy", type: "stock", offset: 0, qty: 1, label: "Own stock" },
      { action: "sell", type: "call", offset: 0.05, qty: 1, label: "Sell 5% OTM call" },
    ],
  },
  {
    slug: "cash-secured-put",
    name: "Cash-Secured Put",
    level: "Beginner",
    outlook: "Bullish",
    tagline: "Get paid to wait for a lower entry price — if you are ready to own.",
    what:
      "Sell a put and set aside enough cash to buy the underlying at the strike. You collect premium. If the stock stays above the strike, you keep it; if it falls, you buy at the strike with a cost basis reduced by the premium.",
    when:
      "You are willing to own the stock at the strike, have the cash available, and expect the price to hold or rise.",
    structure: "Credit",
    risk: "Defined",
    capital: "Strike × lot size held in cash, minus the premium received. Do not confuse this with the much smaller margin on a naked put.",
    example:
      "Spot ₹1,000. Sell the 950-strike put for about ₹8. If the stock stays above ₹950, you keep ₹8. If it falls to ₹900, you are assigned at ₹950; your effective cost is ₹942 before costs.",
    mistakes: [
      "Selling puts on a stock you would not want to own at the strike.",
      "Using margin instead of cash and calling it cash-secured.",
      "Treating the premium as free income while ignoring the full downside.",
    ],
    fails: [
      "The stock gaps down far below the strike; the premium is tiny compared with the loss.",
      "You need the cash before expiry and cannot wait for assignment or buyback.",
      "IV collapses, making the position less profitable if you want to close early.",
    ],
    tip: "The real question is not 'how much premium?' but 'am I happy to own this at the effective price?'",
    related: ["covered-call", "bull-put-spread"],
    tags: ["income", "short premium", "entry strategy"],
    legs: [{ action: "sell", type: "put", offset: -0.05, qty: 1, label: "Sell 5% OTM put" }],
  },
  {
    slug: "bull-call-spread",
    name: "Bull Call Spread",
    level: "Intermediate",
    outlook: "Bullish",
    tagline: "Buy the move, sell the excess — cheaper than a naked call.",
    what:
      "Buy a lower-strike call and sell a higher-strike call with the same expiry. The long call provides upside; the short call finances part of the cost and caps the profit.",
    when:
      "You are moderately bullish, have a target below the short strike, and want to reduce cost, theta and vega compared with a naked call.",
    structure: "Debit",
    risk: "Defined",
    capital: "Net debit. Maximum loss is the debit; maximum profit is the strike width minus the debit.",
    example:
      "Spot ₹1,000. Buy the 1,000 call for ₹24 and sell the 1,050 call for ₹9. Net debit ₹15. Break-even ₹1,015; maximum profit ₹35 if the stock finishes at or above ₹1,050.",
    mistakes: [
      "Setting the short strike below your own target, thereby capping the trade before the thesis completes.",
      "Paying too much for the spread when the short call is far OTM and adds little credit.",
      "Forgetting that both legs must be closed or settled together.",
    ],
    fails: [
      "The stock finishes between the strikes: the spread may profit, but less than expected.",
      "The stock rallies above the target before expiry, but you exit early and leave value on the table.",
      "IV falls sharply, reducing the value of the long call more than the short call.",
    ],
    tip: "The short strike is your profit ceiling. If your target is higher, use a wider spread or a different structure.",
    related: ["long-call", "bull-put-spread"],
    tags: ["debit spread", "defined risk", "moderately bullish"],
    legs: [
      { action: "buy", type: "call", offset: 0, qty: 1, label: "Buy ATM call" },
      { action: "sell", type: "call", offset: 0.05, qty: 1, label: "Sell 5% OTM call" },
    ],
  },
  {
    slug: "bear-put-spread",
    name: "Bear Put Spread",
    level: "Intermediate",
    outlook: "Bearish",
    tagline: "A defined-risk way to be bearish without paying full put premium.",
    what:
      "Buy a higher-strike put and sell a lower-strike put. The long put provides downside exposure; the short put reduces the cost and caps the profit.",
    when:
      "You expect a moderate decline to a target above the short strike, and want to control cost and vega.",
    structure: "Debit",
    risk: "Defined",
    capital: "Net debit. Maximum profit is the strike width minus the debit.",
    example:
      "Spot ₹1,000. Buy the 1,000 put for ₹23 and sell the 950 put for ₹8. Net debit ₹15. Break-even ₹985; maximum profit ₹35 below ₹950.",
    mistakes: [
      "Selling the lower strike too close to spot, which caps the profit too early.",
      "Using a debit spread when a sharp crash is expected — a naked put has more convexity.",
      "Ignoring early assignment on the short put if it becomes deep in the money.",
    ],
    fails: [
      "The stock falls slowly and the spread's value erodes with time.",
      "The stock stays above the long strike and both puts expire worthless.",
      "Volatility collapses after a crash, reducing the mark-to-market gain even if the stock fell.",
    ],
    tip: "A bear put spread is a target-driven trade. Match the width to the decline you actually expect.",
    related: ["long-put", "bear-call-spread"],
    tags: ["debit spread", "defined risk", "bearish"],
    legs: [
      { action: "buy", type: "put", offset: 0, qty: 1, label: "Buy ATM put" },
      { action: "sell", type: "put", offset: -0.05, qty: 1, label: "Sell 5% OTM put" },
    ],
  },
  {
    slug: "bull-put-spread",
    name: "Bull Put Spread",
    level: "Intermediate",
    outlook: "Bullish",
    tagline: "Credit for staying above support, with a defined worst case.",
    what:
      "Sell a higher-strike put and buy a lower-strike put. The credit received is the maximum profit; the difference between strikes minus the credit is the maximum loss.",
    when:
      "You are neutral-to-bullish, expect the stock to hold above the short strike, and want positive theta with a defined risk.",
    structure: "Credit",
    risk: "Defined",
    capital: "Strike width − net credit, held or available as margin. Per unit, this is the maximum loss.",
    example:
      "Spot ₹1,000. Sell the 950 put for ₹8 and buy the 900 put for ₹3. Net credit ₹5. Maximum profit ₹5 if the stock stays above ₹950; maximum loss ₹45 below ₹900.",
    mistakes: [
      "Selling the short put too close to spot for a small credit.",
      "Forgetting that buying the lower put is what defines the risk.",
      "Using the strategy on a stock in a clear downtrend because the credit looks attractive.",
    ],
    fails: [
      "The stock breaks support and both puts finish in the money.",
      "A gap moves the stock below the long strike, realising the maximum loss quickly.",
      "You close the spread early without capturing the remaining theta.",
    ],
    tip: "The short strike is your line in the sand. Size the position so the maximum loss is a planned, acceptable outcome.",
    related: ["cash-secured-put", "iron-condor"],
    tags: ["credit spread", "defined risk", "theta"],
    legs: [
      { action: "sell", type: "put", offset: -0.05, qty: 1, label: "Sell 5% OTM put" },
      { action: "buy", type: "put", offset: -0.1, qty: 1, label: "Buy 10% OTM put" },
    ],
  },
  {
    slug: "bear-call-spread",
    name: "Bear Call Spread",
    level: "Intermediate",
    outlook: "Bearish",
    tagline: "Collect premium from a ceiling you expect to hold.",
    what:
      "Sell a lower-strike call and buy a higher-strike call. The credit is the maximum profit; the difference between strikes minus the credit is the maximum loss.",
    when:
      "You are neutral-to-bearish, expect the stock to stay below the short call, and want a defined-risk credit trade.",
    structure: "Credit",
    risk: "Defined",
    capital: "Strike width − net credit. The long call caps the otherwise unlimited risk.",
    example:
      "Spot ₹1,000. Sell the 1,050 call for ₹9 and buy the 1,100 call for ₹4. Net credit ₹5. Maximum profit ₹5 below ₹1,050; maximum loss ₹45 above ₹1,100.",
    mistakes: [
      "Selling the call too close to spot for a small credit.",
      "Skipping the long call and turning it into a naked short call to collect more premium.",
      "Ignoring a strong uptrend or an upcoming catalyst that could break the ceiling.",
    ],
    fails: [
      "The stock rallies through both strikes and the maximum loss is realised.",
      "A short squeeze or event gap moves the stock far above the long strike.",
      "IV spikes, making an early exit expensive.",
    ],
    tip: "A bear call spread is a probability trade, not a conviction crash bet. Avoid it when a large upward catalyst is imminent.",
    related: ["bear-put-spread", "iron-condor"],
    tags: ["credit spread", "defined risk", "theta"],
    legs: [
      { action: "sell", type: "call", offset: 0.05, qty: 1, label: "Sell 5% OTM call" },
      { action: "buy", type: "call", offset: 0.1, qty: 1, label: "Buy 10% OTM call" },
    ],
  },
  {
    slug: "long-straddle",
    name: "Long Straddle",
    level: "Intermediate",
    outlook: "Volatile",
    tagline: "A big move in either direction, if it is big enough.",
    what:
      "Buy an at-the-money call and an at-the-money put with the same strike and expiry. You profit from a large move either way, but you pay for both options and need to overcome time decay and IV changes.",
    when:
      "You expect a large move but are unsure of direction, and implied volatility is not already extremely high relative to the likely move.",
    structure: "Debit",
    risk: "Defined",
    capital: "Total premium for both legs. Maximum loss occurs if the underlying finishes exactly at the strike.",
    example:
      "Spot ₹1,000. Buy the 1,000 call for ₹24 and the 1,000 put for ₹23. Total cost ₹47. Upper break-even ₹1,047; lower break-even ₹953.",
    mistakes: [
      "Buying a straddle just before a widely anticipated event without checking the implied move.",
      "Holding through the event and being crushed by IV collapse.",
      "Sizing both legs independently and doubling the intended risk.",
    ],
    fails: [
      "The stock moves, but less than the premium implied.",
      "IV collapses after the event even if the direction is right.",
      "Time passes slowly and both options decay before the catalyst arrives.",
    ],
    tip: "Compare the straddle price with the market's implied move. If the move you expect is smaller, do not buy the straddle.",
    related: ["long-strangle", "iron-butterfly"],
    tags: ["long volatility", "event", "non-directional"],
    legs: [
      { action: "buy", type: "call", offset: 0, qty: 1, label: "Buy ATM call" },
      { action: "buy", type: "put", offset: 0, qty: 1, label: "Buy ATM put" },
    ],
  },
  {
    slug: "long-strangle",
    name: "Long Strangle",
    level: "Intermediate",
    outlook: "Volatile",
    tagline: "A cheaper straddle that needs a bigger move.",
    what:
      "Buy an out-of-the-money call and an out-of-the-money put with the same expiry. The cost is lower than a straddle, but both break-evens are further away.",
    when:
      "You expect a very large move and want a lower premium outlay than a straddle, with a directional or event-driven catalyst.",
    structure: "Debit",
    risk: "Defined",
    capital: "Total premium for both legs. Smaller than a straddle, but the probability of profit is also lower.",
    example:
      "Spot ₹1,000. Buy the 1,050 call for ₹9 and the 950 put for ₹8. Total cost ₹17. Upper break-even ₹1,067; lower break-even ₹933.",
    mistakes: [
      "Buying deep OTM strikes because they are cheap, then needing a move that rarely happens.",
      "Ignoring that two commissions and two spreads add to the cost.",
      "Holding through an event with high IV and no plan for the crush.",
    ],
    fails: [
      "The stock moves but stays between the break-evens.",
      "IV collapses after the event; both options lose time value and vega.",
      "The expected catalyst is delayed beyond expiry.",
    ],
    tip: "A strangle is a trade on magnitude, not just direction. Define the move you need and compare it with history and implied move.",
    related: ["long-straddle", "iron-condor"],
    tags: ["long volatility", "cheaper", "event"],
    legs: [
      { action: "buy", type: "put", offset: -0.05, qty: 1, label: "Buy 5% OTM put" },
      { action: "buy", type: "call", offset: 0.05, qty: 1, label: "Buy 5% OTM call" },
    ],
  },
  {
    slug: "iron-condor",
    name: "Iron Condor",
    level: "Advanced",
    outlook: "Range-bound",
    tagline: "Four legs, two wings, one range — collect premium if the market stays put.",
    what:
      "Sell a put spread and a call spread around the current price. You collect a credit and profit if the underlying finishes between the short strikes; the long wings cap the risk on both sides.",
    when:
      "You expect the underlying to stay in a range, implied volatility is relatively high, and you want a defined-risk short-volatility trade.",
    structure: "Credit",
    risk: "Defined",
    capital: "Width of the wider wing − net credit. Maximum profit is the net credit if the price finishes between the short strikes.",
    example:
      "Spot ₹1,000. Sell the 950 put for ₹8, buy the 900 put for ₹3, sell the 1,050 call for ₹9, buy the 1,100 call for ₹4. Net credit ₹10. Profit if the price finishes between ₹950 and ₹1,050; maximum loss ₹40 if it finishes beyond either wing.",
    mistakes: [
      "Selling strikes too close to spot for a small additional credit.",
      "Opening before an event that could break the range.",
      "Ignoring that the maximum loss is several times the maximum profit.",
    ],
    fails: [
      "A trend or gap breaks one side of the range.",
      "IV rises after entry, making the position expensive to close even before expiry.",
      "The stock pins near a short strike and gamma accelerates losses.",
    ],
    tip: "The credit is small relative to the risk. Judge the trade by the probability of staying in range and by the size of the maximum loss, not by the premium collected.",
    related: ["iron-butterfly", "bull-put-spread"],
    tags: ["short volatility", "range", "defined risk"],
    legs: [
      { action: "buy", type: "put", offset: -0.1, qty: 1, label: "Buy 10% OTM put" },
      { action: "sell", type: "put", offset: -0.05, qty: 1, label: "Sell 5% OTM put" },
      { action: "sell", type: "call", offset: 0.05, qty: 1, label: "Sell 5% OTM call" },
      { action: "buy", type: "call", offset: 0.1, qty: 1, label: "Buy 10% OTM call" },
    ],
  },
  {
    slug: "iron-butterfly",
    name: "Iron Butterfly",
    level: "Advanced",
    outlook: "Range-bound",
    tagline: "More credit, a narrower range, and a sharper pin risk.",
    what:
      "Sell an at-the-money call and put, then buy a lower-strike put and a higher-strike call as wings. The result is a defined-risk credit structure that profits most if the underlying finishes exactly at the short strike.",
    when:
      "You expect the underlying to finish very close to the current price, IV is elevated, and you are comfortable with a narrower profit zone than an iron condor.",
    structure: "Credit",
    risk: "Defined",
    capital: "Wing width − net credit. Maximum profit at the short strike.",
    example:
      "Spot ₹1,000. Sell the 1,000 call for ₹24 and put for ₹23, buy the 950 put for ₹8 and the 1,050 call for ₹9. Net credit ₹30. Maximum profit ₹30 at ₹1,000; maximum loss ₹20 beyond either wing.",
    mistakes: [
      "Confusing the high credit with a high probability of keeping it. The profit zone is narrow.",
      "Opening before a known event that could move the price away from the pin.",
      "Ignoring assignment risk on the short ATM options near expiry.",
    ],
    fails: [
      "The stock moves away from the short strike, giving back the credit quickly.",
      "A volatility spike makes the short options more expensive to close.",
      "An early assignment creates an unexpected stock position.",
    ],
    tip: "The iron butterfly is a precision trade. Only use it when you have a reason to expect the price to stay near the strike.",
    related: ["iron-condor", "long-straddle"],
    tags: ["short volatility", "pin", "defined risk"],
    legs: [
      { action: "buy", type: "put", offset: -0.05, qty: 1, label: "Buy 5% OTM put" },
      { action: "sell", type: "put", offset: 0, qty: 1, label: "Sell ATM put" },
      { action: "sell", type: "call", offset: 0, qty: 1, label: "Sell ATM call" },
      { action: "buy", type: "call", offset: 0.05, qty: 1, label: "Buy 5% OTM call" },
    ],
  },
  {
    slug: "calendar-spread",
    name: "Calendar Spread",
    level: "Advanced",
    outlook: "Neutral",
    tagline: "Sell fast decay, own slow optionality.",
    what:
      "Sell a near-term option and buy a longer-term option at the same strike. You finance part of the long option with the short premium and aim to profit from faster near-term time decay and changes in volatility term structure.",
    when:
      "You expect the price to stay near the strike in the near term, want positive vega exposure, and have a view that near-term IV is relatively high versus longer-dated IV.",
    structure: "Debit",
    risk: "Defined",
    capital: "Net debit. The payoff is evaluated at the near-term expiry while the long option still has time value.",
    example:
      "Spot ₹1,000. Sell a 14-day 1,000 call for ₹16 and buy a 45-day 1,000 call for ₹31. Net debit ₹15. If the stock is near ₹1,000 at the near expiry, the long call still has time value and the spread can be closed at a profit.",
    mistakes: [
      "Treating the payoff like an expiration payoff. The long leg still has time value.",
      "Ignoring the short-leg assignment and early-exercise risk.",
      "Using a calendar when a large directional move is expected; the short leg can be breached.",
    ],
    fails: [
      "The stock moves sharply away from the strike, hurting the short leg faster than the long leg helps.",
      "Implied volatility falls across the curve, reducing the long option's value.",
      "The near-term option is assigned early, leaving an unintended position.",
    ],
    tip: "A calendar is a volatility-and-time trade, not a simple range bet. Watch the term structure and the short leg's gamma near expiry.",
    related: ["diagonal-spread", "long-straddle"],
    tags: ["time spread", "vega", "neutral"],
    probabilityEligible: false,
    legs: [
      { action: "sell", type: "call", offset: 0, qty: 1, expiryDays: 14, label: "Sell 14-day ATM call" },
      { action: "buy", type: "call", offset: 0, qty: 1, expiryDays: 45, label: "Buy 45-day ATM call" },
    ],
  },
  {
    slug: "diagonal-spread",
    name: "Diagonal Spread",
    level: "Advanced",
    outlook: "Bullish",
    tagline: "A calendar with a directional tilt.",
    what:
      "Buy a longer-dated option and sell a shorter-dated option at a different strike. It combines time-spread and directional characteristics, with the short leg generating income against the long leg.",
    when:
      "You are moderately bullish, want to own longer-dated upside, and are willing to cap near-term gains by selling a shorter-dated call.",
    structure: "Debit",
    risk: "Defined",
    capital: "Net debit. The short leg reduces cost but adds early-assignment and upside-cap considerations.",
    example:
      "Spot ₹1,000. Buy a 60-day 1,000 call for ₹36 and sell a 21-day 1,050 call for ₹6. Net debit ₹30. If the stock drifts to ₹1,050 by the short expiry, the long call retains time value and the short call expires worthless.",
    mistakes: [
      "Confusing a diagonal with a simple spread and ignoring the different expiries.",
      "Selling a short strike below your target and capping the thesis.",
      "Forgetting that the short leg may need to be rolled or closed separately.",
    ],
    fails: [
      "The stock falls, and the long-dated call loses value along with the short premium.",
      "The stock rallies through the short strike before expiry.",
      "Term-structure changes reduce the long leg's value more than expected.",
    ],
    tip: "Treat the two expiries as two separate decisions. The short leg is a tactical income trade; the long leg is the strategic position.",
    related: ["calendar-spread", "covered-call"],
    tags: ["time spread", "bullish", "income"],
    probabilityEligible: false,
    legs: [
      { action: "buy", type: "call", offset: 0, qty: 1, expiryDays: 60, label: "Buy 60-day ATM call" },
      { action: "sell", type: "call", offset: 0.05, qty: 1, expiryDays: 21, label: "Sell 21-day 5% OTM call" },
    ],
  },
  {
    slug: "butterfly-spread",
    name: "Butterfly Spread",
    level: "Advanced",
    outlook: "Neutral",
    tagline: "A low-cost pin-point bet with a strictly defined outcome.",
    what:
      "Buy one lower-strike call, sell two at-the-money calls, and buy one higher-strike call. The result is a low-cost, defined-risk structure that pays the most if the underlying finishes at the middle strike.",
    when:
      "You expect the underlying to finish near a specific price, want a low-cost position, and are comfortable with a narrow profit zone.",
    structure: "Debit",
    risk: "Defined",
    capital: "Net debit. Maximum profit is the wing width minus the net debit; maximum loss is the debit.",
    example:
      "Spot ₹1,000. Buy the 950 call for ₹58, sell two 1,000 calls for ₹24 each, buy the 1,050 call for ₹9. Net debit ₹19. Maximum profit ₹31 if the stock finishes at ₹1,000; maximum loss ₹19 outside the wings.",
    mistakes: [
      "Buying the butterfly too far from the expected finish price.",
      "Ignoring the two short calls' assignment risk near expiry.",
      "Overpaying for the structure; small debit changes dramatically alter the risk/reward.",
    ],
    fails: [
      "The stock finishes away from the middle strike and the trade loses the debit.",
      "A large move makes the short calls expensive to manage before expiry.",
      "Low liquidity in the wings creates wide spreads and poor fills.",
    ],
    tip: "The butterfly is a precision instrument. It is usually a trade on where the price will be, not merely on a range.",
    related: ["iron-butterfly", "iron-condor"],
    tags: ["defined risk", "pin", "low cost"],
    legs: [
      { action: "buy", type: "call", offset: -0.05, qty: 1, label: "Buy 5% OTM call" },
      { action: "sell", type: "call", offset: 0, qty: 2, label: "Sell 2 ATM calls" },
      { action: "buy", type: "call", offset: 0.05, qty: 1, label: "Buy 5% OTM call" },
    ],
  },
  {
    slug: "ratio-spread",
    name: "Ratio Spread",
    level: "Advanced",
    outlook: "Bullish",
    tagline: "Sell more than you buy — more income, and a dangerous tail.",
    what:
      "Buy one call and sell two higher-strike calls (a 1:2 call ratio). The extra short call can turn the structure into a credit, but it also creates unlimited risk above the upper strike.",
    when:
      "You are moderately bullish, expect the price to rise to the short strike but not far beyond it, and fully understand the uncovered tail risk.",
    structure: "Variable",
    risk: "Undefined",
    capital: "The extra naked short call requires margin and can create losses far beyond the initial credit. The risk is not defined.",
    example:
      "Spot ₹1,000. Buy the 1,000 call for ₹24 and sell two 1,050 calls for ₹9 each. Net debit ₹6. Maximum profit near ₹1,050 is approximately ₹44; above ₹1,050, each extra point loses ₹1 per unit because two calls are short against one long.",
    mistakes: [
      "Thinking the extra short call is 'free income'. It is a leveraged short-volatility position.",
      "Using the ratio when a sharp rally is possible. The loss above the upper strike is unlimited.",
      "Ignoring margin calls and the cost of covering the extra short call.",
    ],
    fails: [
      "The stock rallies far above the short strike and the extra short call loses without a cap.",
      "The stock falls below the long strike and the entire debit is lost.",
      "A volatility spike raises the cost of buying back the short calls.",
    ],
    tip: "A ratio spread is not a beginner strategy. If you cannot explain the unlimited tail and margin impact in one sentence, do not trade it.",
    related: ["bull-call-spread", "iron-condor"],
    tags: ["ratio", "undefined risk", "advanced"],
    legs: [
      { action: "buy", type: "call", offset: 0, qty: 1, label: "Buy ATM call" },
      { action: "sell", type: "call", offset: 0.05, qty: 2, label: "Sell 2× 5% OTM calls" },
    ],
  },
];

export const STRATEGY_LEVELS: StrategyLevel[] = ["Beginner", "Intermediate", "Advanced"];

export const OUTLOOKS: MarketOutlook[] = ["Bullish", "Bearish", "Neutral", "Range-bound", "Volatile"];

export function getStrategy(slug: string) {
  return STRATEGIES.find((strategy) => strategy.slug === slug);
}

export function strikeTick(spot: number) {
  if (spot >= 20000) return 100;
  if (spot >= 5000) return 50;
  if (spot >= 1000) return 10;
  if (spot >= 100) return 5;
  return 1;
}

export interface BuildStrategyOptions {
  spot?: number;
  days?: number;
  iv?: number;
  rate?: number;
  dividendYield?: number;
}

export function buildStrategyLegs(
  strategy: OptionsStrategy,
  { spot = DEFAULT_SPOT, days = 30, iv = DEFAULT_IV, rate = DEFAULT_RATE, dividendYield = 0 }: BuildStrategyOptions = {},
): OptionLeg[] {
  const tick = strikeTick(spot);
  return strategy.legs.map((leg) => {
    const expiryDays = leg.expiryDays ?? days;
    if (leg.type === "stock") {
      return {
        type: "stock",
        side: leg.action === "buy" ? "long" : "short",
        qty: leg.qty,
        strike: spot,
        premium: spot,
        multiplier: 1,
        expiryDays,
        iv,
        label: leg.label,
      };
    }
    const rawStrike = spot * (1 + leg.offset);
    const strike = Math.max(tick, Math.round(rawStrike / tick) * tick);
    const price = blackScholes({
      spot,
      strike,
      time: Math.max(expiryDays, 1) / 365,
      rate,
      volatility: iv,
      dividendYield,
      type: leg.type,
    }).price;
    return {
      type: leg.type,
      side: leg.action === "buy" ? "long" : "short",
      qty: leg.qty,
      strike,
      premium: Math.max(0.05, Math.round(price * 100) / 100),
      multiplier: 1,
      expiryDays,
      iv,
      label: leg.label,
    };
  });
}

export interface StrategyAnalysis {
  legs: OptionLeg[];
  analysis: ReturnType<typeof analyzePayoff>;
  probability: ReturnType<typeof estimateProbability> | null;
  netPremium: number;
  evaluationDays: number;
  debitCreditLabel: string;
}

export function analyzeStrategy(
  strategy: OptionsStrategy,
  options: BuildStrategyOptions = {},
): StrategyAnalysis {
  const spot = options.spot ?? DEFAULT_SPOT;
  const legs = buildStrategyLegs(strategy, options);
  const evaluationDays = Math.min(...legs.map((leg) => leg.expiryDays ?? 30));
  const analysis = analyzePayoff(legs, {
    daysElapsed: evaluationDays,
    lower: Math.max(0, spot * 0.5),
    upper: spot * 1.6,
  });
  const net = computeNetPremium(legs);
  const probability =
    strategy.probabilityEligible === false
      ? null
      : estimateProbability(legs, spot, evaluationDays, options.iv ?? DEFAULT_IV, options.rate ?? DEFAULT_RATE);
  return {
    legs,
    analysis,
    probability,
    netPremium: net,
    evaluationDays,
    debitCreditLabel: net > 0.004 ? "Net debit" : net < -0.004 ? "Net credit" : "Flat",
  };
}

export function formatStrategyPayoffNote(strategy: OptionsStrategy) {
  if (strategy.slug === "covered-call") return "Stock upside capped at short strike; downside remains.";
  if (strategy.slug === "cash-secured-put") return "Profit capped at premium; assignment at the strike is the real outcome.";
  if (strategy.slug === "calendar-spread" || strategy.slug === "diagonal-spread")
    return "Evaluated at the near-term expiry while the long leg retains time value.";
  if (strategy.slug === "ratio-spread") return "Undefined risk above the short strikes. Size accordingly.";
  if (strategy.risk === "Defined") return "Maximum loss is defined by the structure.";
  return "Risk is not fully capped. Margin and tail risk must be monitored.";
}
