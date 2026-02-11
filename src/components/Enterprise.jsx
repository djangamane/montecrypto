import {
  ArrowRight,
  Code2,
  Server,
  Webhook,
  Zap,
  Key,
  LifeBuoy,
  Shield,
  Clock,
  Users,
  BarChart3,
  Mail,
} from "lucide-react";

const integrations = [
  {
    icon: Server,
    title: "MCP Server",
    description:
      "Drop our Model Context Protocol server into Claude, Cursor, or any MCP-compatible agent. One install, instant risk data.",
    badge: "Live on npm",
  },
  {
    icon: Code2,
    title: "REST API",
    description:
      "Simple JSON endpoints for token risk scores, on-chain analytics, and social-signal breakdowns. Ship in an afternoon.",
    badge: "Available now",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description:
      "Get real-time alerts when a token's risk profile changes. Push notifications straight to your backend.",
    badge: "Coming soon",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "For indie developers and small teams getting started.",
    features: [
      { text: "1,000 API calls/day", icon: Zap },
      { text: "1 API key", icon: Key },
      { text: "Full risk scoring", icon: Shield },
      { text: "Email support", icon: LifeBuoy },
    ],
    cta: "Get Started",
    href: "mailto:jason@aicryptorisk.com?subject=Starter%20API%20Plan%20Inquiry",
  },
  {
    name: "Growth",
    price: "$149",
    period: "/mo",
    description: "For teams shipping production integrations.",
    features: [
      { text: "10,000 API calls/day", icon: Zap },
      { text: "5 API keys", icon: Key },
      { text: "Full risk scoring", icon: Shield },
      { text: "Webhook alerts", icon: Webhook },
      { text: "Priority support", icon: LifeBuoy },
    ],
    cta: "Get Started",
    href: "mailto:jason@aicryptorisk.com?subject=Growth%20API%20Plan%20Inquiry",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For exchanges, wallets, and compliance teams at scale.",
    features: [
      { text: "Unlimited API calls", icon: Zap },
      { text: "Unlimited API keys", icon: Key },
      { text: "Custom integrations", icon: Code2 },
      { text: "SLA guarantee", icon: Clock },
      { text: "Dedicated support", icon: Users },
    ],
    cta: "Book a Call",
    href: "mailto:jason@aicryptorisk.com?subject=Enterprise%20API%20Inquiry",
  },
];

export function Enterprise() {
  return (
    <main id="main-content">
      {/* Hero */}
      <section className="border-b border-brand-muted/20 bg-gradient-to-br from-brand-bg to-brand-surface px-6 py-20">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-link/70">
            For developers &amp; teams
          </p>
          <h1 className="text-5xl font-heading uppercase leading-none text-brand-text md:text-6xl">
            Crypto Risk Intelligence
            <br />
            <span className="text-brand-link">for Your Product</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-brand-muted">
            Integrate institutional-grade token risk scoring into your exchange,
            wallet, or compliance workflow. REST API, MCP server, and webhooks
            &mdash; built for teams that ship.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="mailto:jason@aicryptorisk.com?subject=Enterprise%20API%20Inquiry"
              className="inline-flex items-center justify-center rounded-xl bg-brand-accent px-6 py-3 text-base font-semibold text-brand-text shadow transition hover:opacity-90"
            >
              <Mail className="mr-2 h-4 w-4" />
              <span>Book a Call</span>
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded-xl border border-brand-link/40 px-6 py-3 text-base font-semibold text-brand-link transition hover:border-brand-link hover:text-brand-text"
            >
              View API Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Integration Options */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-link/70">
              Integration
            </p>
            <h2 className="mt-3 text-3xl font-heading uppercase text-brand-text">
              Three Ways to Connect
            </h2>
            <p className="mt-2 text-base text-brand-muted">
              Pick the integration that fits your stack. All endpoints return the
              same four-analyzer risk model.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {integrations.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex flex-col gap-4 rounded-3xl border border-brand-muted/30 bg-white/85 p-8 shadow-xl transition hover:border-brand-link/60"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-9 w-9 text-brand-link" />
                    <span className="rounded-full bg-brand-link/10 px-3 py-1 text-xs font-semibold text-brand-link">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-brand-text">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-brand-muted">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-y border-brand-muted/20 bg-white/80 px-6 py-12">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 text-center">
          <div>
            <p className="text-3xl font-heading uppercase text-brand-text">
              244+
            </p>
            <p className="text-sm text-brand-muted">MCP installs in 48 hrs</p>
          </div>
          <div className="hidden h-8 w-px bg-brand-muted/30 sm:block" />
          <div>
            <p className="text-3xl font-heading uppercase text-brand-text">4</p>
            <p className="text-sm text-brand-muted">Independent analyzers</p>
          </div>
          <div className="hidden h-8 w-px bg-brand-muted/30 sm:block" />
          <div>
            <p className="text-3xl font-heading uppercase text-brand-text">
              2017
            </p>
            <p className="text-sm text-brand-muted">Tracking crypto risk</p>
          </div>
          <div className="hidden h-8 w-px bg-brand-muted/30 sm:block" />
          <div>
            <BarChart3 className="mx-auto h-8 w-8 text-brand-link" />
            <p className="mt-1 text-sm text-brand-muted">
              On-chain + off-chain + social + institutional
            </p>
          </div>
        </div>
      </section>

      {/* API Pricing */}
      <section id="pricing" className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-link/70">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-heading uppercase text-brand-text">
              API Plans
            </h2>
            <p className="mt-2 text-base text-brand-muted">
              Monthly plans built for production workloads. No per-query
              surprises.
            </p>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-3xl border p-8 shadow-xl ${
                  tier.highlighted
                    ? "border-brand-link bg-white ring-2 ring-brand-link/20"
                    : "border-brand-muted/30 bg-white/85"
                }`}
              >
                {tier.highlighted && (
                  <span className="mb-4 inline-block self-start rounded-full bg-brand-link/10 px-3 py-1 text-xs font-semibold text-brand-link">
                    Most popular
                  </span>
                )}
                <h3 className="text-2xl font-heading uppercase text-brand-text">
                  {tier.name}
                </h3>
                <p className="mt-4">
                  <span className="text-5xl font-heading uppercase text-brand-text">
                    {tier.price}
                  </span>
                  <span className="text-base text-brand-muted">
                    {tier.period}
                  </span>
                </p>
                <p className="mt-4 text-sm text-brand-muted">
                  {tier.description}
                </p>
                <ul className="mt-6 flex-grow space-y-3 text-sm text-brand-muted/90">
                  {tier.features.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <li
                        key={feature.text}
                        className="flex items-start gap-3"
                      >
                        <Icon className="mt-0.5 h-5 w-5 text-brand-link" />
                        <span>{feature.text}</span>
                      </li>
                    );
                  })}
                </ul>
                <a
                  href={tier.href}
                  className={`mt-8 inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold shadow transition hover:opacity-90 ${
                    tier.highlighted
                      ? "bg-brand-accent text-brand-text"
                      : "border border-brand-link/40 text-brand-link hover:border-brand-link hover:text-brand-text"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-brand-muted/20 bg-gradient-to-br from-brand-bg to-brand-surface px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-heading uppercase text-brand-text">
            Ready to Integrate?
          </h2>
          <p className="mt-2 text-base leading-relaxed text-brand-muted">
            Tell us about your use case and we&apos;ll get you set up with the
            right plan.
          </p>
          <div className="mt-8">
            <a
              href="mailto:jason@aicryptorisk.com?subject=Enterprise%20API%20Inquiry"
              className="inline-flex items-center justify-center rounded-xl bg-brand-accent px-6 py-3 text-base font-semibold text-brand-text shadow transition hover:opacity-90"
            >
              <Mail className="mr-2 h-4 w-4" />
              <span>Book a Call</span>
            </a>
          </div>
          <p className="mt-6 text-sm text-brand-muted">
            Or email us directly at{" "}
            <a
              href="mailto:jason@aicryptorisk.com"
              className="font-semibold text-brand-link"
            >
              jason@aicryptorisk.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
