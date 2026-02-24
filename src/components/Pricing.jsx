import {
  ScanLine,
  Newspaper,
  LifeBuoy,
  Download,
  Infinity,
  Users,
  Check,
} from "lucide-react";
import { StripePaymentLinks } from "./payments/StripePaymentLinks.jsx";

const tiers = [
  {
    name: "Essential",
    price: "$9",
    billing: "per month",
    description: "Personalize your risk environment with fundamental audits.",
    features: [
      { text: "75 scans per month", icon: ScanLine },
      { text: "50 API calls/day", icon: ScanLine },
      { text: "Weekly newsletter", icon: Newspaper },
      { text: "Email support", icon: LifeBuoy },
    ],
    buttonText: "Join Protocol",
    highlight: false,
  },
  {
    name: "Performance",
    price: "$69",
    billing: "per year",
    description: "Advanced intelligence for professional digital asset management.",
    features: [
      { text: "150 scans per month", icon: ScanLine },
      { text: "100 API calls/day", icon: ScanLine },
      { text: "Weekly newsletter", icon: Newspaper },
      { text: "Advanced Reporting", icon: Download },
      { text: "Priority Support", icon: LifeBuoy },
    ],
    buttonText: "Elevate Status",
    highlight: true,
  },
  {
    name: "Elite",
    price: "$199",
    billing: "lifetime access",
    description: "Unlimited persistence for institutional-grade security.",
    features: [
      { text: "200 scans per month", icon: ScanLine },
      { text: "200 API calls/day", icon: ScanLine },
      { text: "Weekly newsletter", icon: Newspaper },
      { text: "Lifetime updates", icon: Infinity },
      { text: "Limited to 50 slots", icon: Users },
    ],
    buttonText: "Claim Residency",
    highlight: false,
  },
];

export function Pricing({ session }) {
  return (
    <section id="pricing" className="bg-brand-bg px-6 py-24 md:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center space-y-4">
          <h2 className="text-4xl font-bold uppercase tracking-tight text-brand-text md:text-5xl">
            Membership <span className="font-drama italic text-brand-accent">Tiers.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-brand-muted">
            Select the level of intelligence required for your portfolio defense.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:items-center">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-premium p-8 transition-all duration-500 hover:translate-y-[-8px] ${tier.highlight
                  ? "bg-brand-primary text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] scale-105 z-10"
                  : "bg-white text-brand-text border border-brand-muted/10"
                }`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-accent px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text">
                  Most Requested
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-sm font-bold uppercase tracking-[0.3em] ${tier.highlight ? 'text-brand-accent' : 'text-brand-muted'}`}>
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-6xl font-extrabold tracking-tight">{tier.price}</span>
                  <span className={`text-xs font-medium uppercase tracking-widest ${tier.highlight ? 'text-white/40' : 'text-brand-muted/60'}`}>
                    {tier.billing}
                  </span>
                </div>
                <p className={`mt-4 text-sm leading-relaxed ${tier.highlight ? 'text-white/60' : 'text-brand-muted'}`}>
                  {tier.description}
                </p>
              </div>

              <ul className="mb-10 space-y-4 flex-grow">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 items-center justify-center rounded-full ${tier.highlight ? 'bg-brand-accent/20 text-brand-accent' : 'bg-brand-primary/5 text-brand-primary'}`}>
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </div>
                    <span className={`text-sm font-medium ${tier.highlight ? 'text-white/80' : 'text-brand-text/80'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button className={`btn-magnetic w-full rounded-full py-4 text-xs font-bold uppercase tracking-[0.2em] shadow-xl ${tier.highlight
                  ? "bg-brand-accent text-brand-text"
                  : "bg-brand-primary text-white"
                }`}>
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted/40 mb-8">Secure Terminal Selection</p>
          <div className="max-w-md mx-auto grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all">
            <StripePaymentLinks session={session} />
          </div>
        </div>
      </div>
    </section>
  );
}
