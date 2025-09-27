export function BookingModal({ isOpen, onClose, hasPaid, onSetHasPaid }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-brand-muted/40 bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-heading uppercase text-brand-text">Reserve your session</h3>
            <p className="mt-2 text-sm text-brand-muted">
              Secure checkout opens in a new tab. Return here to confirm payment and pick a time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-2xl leading-none text-brand-muted transition hover:text-brand-text"
          >
            ×
          </button>
        </div>

        {!hasPaid ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-brand-muted/30 bg-brand-bg/80 p-5">
              <p className="text-lg font-semibold text-brand-text">Investment</p>
              <p className="mt-1 text-sm text-brand-muted">
                $500 USD via PayPal or card · $350 when paying with Bitcoin.
              </p>
            </div>
            <div className="space-y-3">
              <a
                href="https://commerce.coinbase.com/checkout/e9ab3e94-246d-4269-959b-f22594bb07aa"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl border border-brand-link/40 bg-brand-link/10 px-4 py-3 text-center text-sm font-semibold text-brand-link transition hover:border-brand-link hover:bg-brand-link hover:text-brand-bg"
              >
                Pay with Bitcoin ($350)
              </a>
              <form action="https://www.paypal.com/ncp/payment/UU7PJQU44NA2U" method="post" target="_blank" className="contents">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-brand-text shadow transition hover:opacity-90"
                >
                  Pay with PayPal / Card ($500)
                </button>
              </form>
            </div>
            <button
              type="button"
              onClick={() => onSetHasPaid(true)}
              className="w-full rounded-xl border border-brand-link px-4 py-3 text-sm font-semibold text-brand-link transition hover:bg-brand-link hover:text-brand-bg"
            >
              I have paid, continue to scheduling
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-sm text-brand-muted">
              Thank you for your payment! Choose your session slot below. Calendly loads inside the frame; contact
              us if you need a custom time.
            </p>
            <div
              className="calendly-inline-widget mt-6 rounded-2xl border border-brand-muted/30"
              data-url="https://calendly.com/abitofadviceconsulting/crypto-coaching-session"
              style={{ minWidth: '320px', height: '700px' }}
            ></div>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-brand-muted">
          By continuing you agree to our
          {' '}<a href="/legal/terms" className="font-semibold text-brand-link hover:text-brand-text">Terms</a>,
          {' '}<a href="/legal/privacy" className="font-semibold text-brand-link hover:text-brand-text">Privacy Policy</a>, and
          {' '}<a href="/disclaimer" className="font-semibold text-brand-link hover:text-brand-text">Risk Disclaimer</a>.
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-brand-muted/40 px-4 py-3 text-sm font-semibold text-brand-muted transition hover:border-brand-link hover:text-brand-text"
        >
          Close
        </button>
      </div>
    </div>
  );
}
