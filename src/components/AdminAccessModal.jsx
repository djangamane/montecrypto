import { X } from 'lucide-react';
import { AuthPanel } from './auth/AuthPanel.jsx';
import { useSupabaseSession } from '../hooks/useSupabaseSession.js';

export function AdminAccessModal({ isOpen, onClose }) {
  const { session, isLoading } = useSupabaseSession();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white"
          aria-label="Close admin sign in"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-4 text-slate-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">MonteCrypto Admin</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Sign in to manage Scam Watch</h2>
            <p className="text-sm text-slate-400">
              Use your internal credentials to access the Scam Likely scanner, newsletter generation tools,
              and subscriber reports.
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-slate-300">
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
