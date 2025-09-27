import { X } from 'lucide-react';
import { AuthPanel } from './auth/AuthPanel.jsx';
import { useSupabaseSession } from '../hooks/useSupabaseSession.js';

export function AdminAccessModal({ isOpen, onClose }) {
  const { session, isLoading } = useSupabaseSession();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-brand-muted/40 bg-white p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-brand-muted/40 bg-brand-bg/80 p-2 text-brand-muted transition hover:border-brand-link hover:text-brand-text"
          aria-label="Close admin sign in"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-4 text-sm text-brand-muted">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-link/70">MonteCrypto admin</p>
            <h2 className="mt-2 text-3xl font-heading uppercase text-brand-text">Manage the risk platform</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Use your internal credentials to access the AI Crypto Risk Assessment analyzer, Weekly Risk Brief
              generation tools, and subscriber reports.
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-brand-muted/30 bg-brand-bg/80 px-4 py-6 text-center text-brand-muted">
              Checking session…
            </div>
          ) : (
            <AuthPanel session={session} />
          )}
        </div>
      </div>
    </div>
  );
}
