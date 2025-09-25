export function BookingModal({ isOpen, onClose, hasPaid, onSetHasPaid }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full relative">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-white">Book Your Session</h3>
          <button onClick={onClose} aria-label="Close modal" className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        {!hasPaid ? (
          // Step 1: Payment View
          <div>
            <p className="text-gray-300 mb-6">
              To book your premium session, please complete your payment using one of the options below.
            </p>
            <div className="space-y-4">
              <a
                href="https://commerce.coinbase.com/checkout/e9ab3e94-246d-4269-959b-f22594bb07aa"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Pay with Crypto ($200)
              </a>
              {/* PayPal Button Form */}
              <form action="https://www.paypal.com/ncp/payment/UU7PJQU44NA2U" method="post" target="_blank" className="contents">
                <button type="submit" className="w-full text-center bg-[#FFD140] text-black font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                  Pay with PayPal / Card ($300)
                </button>
              </form>
            </div>
            <button onClick={() => onSetHasPaid(true)} className="mt-8 w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors">
              I Have Paid, Continue to Booking
            </button>
          </div>
        ) : (
          // Step 2: Booking View
          <div>
            <p className="text-gray-300 mb-6">
              Thank you for your payment! Please select a time below to schedule your session.
            </p>
            <div
              className="calendly-inline-widget bg-white rounded-lg"
              data-url="https://calendly.com/abitofadviceconsulting/crypto-coaching-session"
              style={{ minWidth: '320px', height: '700px' }}
            ></div>
          </div>
        )}

        <button onClick={onClose} className="mt-6 w-full bg-white/10 text-white font-semibold py-3 rounded-lg hover:bg-white/20 transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}