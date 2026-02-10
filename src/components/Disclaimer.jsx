export function Disclaimer({ variant = "full" }) {
  if (variant === "compact") {
    return (
      <p className="text-xs text-brand-muted">
        Not financial advice. For educational purposes only.{" "}
        <a href="/disclaimer.html" className="underline hover:text-brand-text">
          Full disclaimer
        </a>
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-brand-muted/20 bg-brand-muted/5 p-4 text-xs text-brand-muted">
      <p className="font-semibold mb-2">Important Disclaimer</p>
      <p className="mb-2">
        AI Crypto Risk provides <strong>risk analysis tools</strong>, not financial advice. Our analysis
        is based on on-chain data and publicly available information. It is intended for educational
        and informational purposes only.
      </p>
      <p className="mb-2">
        <strong>This is not investment advice.</strong> We do not recommend buying, selling, or holding
        any cryptocurrency. All investment decisions are yours alone. Cryptocurrency markets are highly
        volatile and you may lose some or all of your investment.
      </p>
      <p>
        Always do your own research (DYOR) and consult with a qualified financial advisor before making
        investment decisions.{" "}
        <a href="/disclaimer.html" className="underline hover:text-brand-text">
          Read our full disclaimer
        </a>
      </p>
    </div>
  );
}

export function RiskDisclaimer() {
  return (
    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 text-xs text-brand-muted">
      <p className="font-semibold text-yellow-600 mb-1">Risk Analysis Disclaimer</p>
      <p>
        Risk scores are algorithmic assessments based on on-chain data. A low score does not guarantee
        safety, and a high score does not guarantee a scam. Smart contract analysis has limitations.
        Always verify findings independently before making decisions.
      </p>
    </div>
  );
}
