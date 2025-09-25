import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';

export function AuthPanel({ session }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuth = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your inbox to confirm your email.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (session) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-slate-200">
        <p className="text-sm">Signed in as {session.user.email}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleAuth}
      className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/60 p-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-white">
          {mode === 'signup' ? 'Create an account' : 'Sign in'}
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          Use the same credentials across the MonteCrypto tools.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm text-slate-300">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </label>

        <label className="block text-sm text-slate-300">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </label>
      </div>

      {message ? <p className="text-sm text-orange-300">{message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
      >
        {isSubmitting ? 'Working…' : mode === 'signup' ? 'Sign up' : 'Sign in'}
      </button>

      <div className="text-center text-xs text-slate-500">
        {mode === 'signup' ? (
          <button
            type="button"
            onClick={() => setMode('signin')}
            className="underline decoration-dotted"
          >
            Already have an account?
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMode('signup')}
            className="underline decoration-dotted"
          >
            Need an account?
          </button>
        )}
      </div>
    </form>
  );
}
