import {
  ScanLine,
  Newspaper,
  LifeBuoy,
  Download,
  Infinity,
  Users,
} from "lucide-react";
import { StripePaymentLinks } from "./payments/StripePaymentLinks.jsx";

const tiers = [
  {
    name: "Monthly",
    price: "$5",
    description: "150 scans/month plus weekly Scam Watch newsletter.",
    features: [
      { text: "150 scans per month", icon: ScanLine },
      { text: "Weekly newsletter", icon: Newspaper },
      { text: "Email support", icon: LifeBuoy },
    ],
  },
  {
    name: "Yearly",
    price: "$50",
    description:
      "Save two months with annual billing. Includes advanced reporting.",
    features: [
      { text: "300 scans per month", icon: ScanLine },
      { text: "Weekly newsletter", icon: Newspaper },
      { text: "Email export (coming soon)", icon: Download },
      { text: "Priority support", icon: LifeBuoy },
    ],
  },
  {
    name: "Lifetime",
    price: "$200",
    description:
      "One-time payment for lifetime Scam Likely access and updates.",
    features: [
      { text: "400 scans per month", icon: ScanLine },
      { text: "Weekly newsletter", icon: Newspaper },
      { text: "Email export (coming soon)", icon: Download },
      { text: "Lifetime access", icon: Infinity },
      { text: "Limited to 50 slots", icon: Users },
    ],
  },
];

export function Pricing({ session }) {
  return (
    <section id="pricing" className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-heading uppercase text-brand-text">
            Pricing
          </h2>
          <p className="mt-2 text-base leading-relaxed text-brand-muted">
            Choose the plan that&apos;s right for you.
          </p>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="rounded-3xl border border-brand-muted/30 bg-white/85 p-8 shadow-xl flex flex-col"
            >
              <h3 className="text-2xl font-heading uppercase text-brand-text">
                {tier.name}
              </h3>
              <p className="mt-4 text-5xl font-heading uppercase text-brand-text">
                {tier.price}
              </p>
              <p className="mt-4 text-sm text-brand-muted">
                {tier.description}
              </p>
              <ul className="mt-6 space-y-3 text-sm text-brand-muted/90 flex-grow">
                {tier.features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <li key={feature.text} className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-5 w-5 text-brand-link" />
                      <span>{feature.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 max-w-md mx-auto">
          <StripePaymentLinks session={session} />
        </div>
      </div>
    </section>
  );
}
