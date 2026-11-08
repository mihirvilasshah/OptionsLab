import Link from "next/link";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { Logo } from "@/components/layout/logo";

const columns = [
  {
    title: "Learn",
    links: [
      { href: "/learn/options-basics", label: "Options Basics" },
      { href: "/learn/option-terminology", label: "Option Terminology" },
      { href: "/learn/call-options", label: "Call Options" },
      { href: "/learn/put-options", label: "Put Options" },
      { href: "/learn/option-greeks", label: "The Greeks" },
      { href: "/learn/implied-volatility", label: "Implied Volatility" },
    ],
  },
  {
    title: "Practise",
    links: [
      { href: "/playground", label: "Interactive Playground" },
      { href: "/strategies", label: "Strategy Lab" },
      { href: "/calculator", label: "Options Calculators" },
      { href: "/simulator", label: "Paper Trading" },
      { href: "/markets", label: "Simulated Market" },
      { href: "/quiz", label: "Quiz & Challenges" },
    ],
  },
  {
    title: "Reference",
    links: [
      { href: "/glossary", label: "Glossary" },
      { href: "/risk", label: "Risk Playbook" },
      { href: "/learn/expiration-and-lifecycle", label: "Expiry & Settlement" },
      { href: "/calculator?tool=black-scholes", label: "Black–Scholes" },
      { href: "/quiz#daily", label: "Daily Challenge" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-border bg-card/30">
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              An interactive options-trading university. Learn the mechanics, visualise the payoff,
              practise the decision — before risking real capital.
            </p>
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-warning/25 bg-warning-soft/50 p-3">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                <strong className="font-semibold text-foreground">Educational use only.</strong>{" "}
                Not financial advice, investment recommendations or trading signals. Options trading
                can lose more than your initial premium. All examples are hypothetical.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                  {column.title}
                </p>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="divider-fade my-8" />

        <div className="flex flex-col gap-4 text-[11px] leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} Options Lab. Built for learning. No real orders, ever.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span>Market data: simulated unless explicitly labelled otherwise.</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>Theoretical Greeks use Black–Scholes.</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <a
              href="https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=3&ssid=15&smid=10"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              Investor education <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
