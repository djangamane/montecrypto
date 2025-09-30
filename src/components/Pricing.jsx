import { CheckCircle2 } from "lucide-react";
import { PayPalSubscriptionButton } from "./payments/PayPalSubscriptionButton";

const tiers = [
  {
    name: "Monthly",
    price: "$10",
    description: "150 scans/month, plus weekly newsletter.",
    features: ["150 scans per month", "Weekly newsletter", "Email support"],
  },
  {
    name: "Yearly",
    price: "$100",
    description:
      "300 scans/month, plus weekly newsletter and email export (coming soon).",
    features: [
      "300 scans per month",
      "Weekly newsletter",
      "Email export (coming soon)",
      "Priority support",
    ],
  },
  {
    name: "Lifetime",
    price: "$275",
    description:
      "400 scans/month, newsletter, and export (coming soon). Limited to 50 slots.",
    features: [
      "400 scans per month",
      "Weekly newsletter",
      "Email export (coming soon)",
      "Lifetime access",
      "Limited to 50 slots",
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
            Choose the plan that's right for you.
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
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-link" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 max-w-md mx-auto">
          <PayPalSubscriptionButton session={session} />
        </div>
        <div className="mt-10 text-center">
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdfFpBCy2_f_l_f_l_f_l_f_l_f_l_f_l_f_l_f_l_f/viewform?usp=sf_link"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-muted underline decoration-dotted"
          >
            Contact us for enterprise solutions
          </a>
        </div>
      </div>
    </section>
  );
}
