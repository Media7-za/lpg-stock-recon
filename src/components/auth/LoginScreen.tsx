import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
    }
    // On success, useAuth's onAuthStateChange listener updates the session
    // and this screen unmounts — no local success state needed.
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-surface border border-border rounded-xl p-6 space-y-4"
      >
        <div>
          <h1 className="text-lg font-black text-text-primary">LPG Stock Reconciliation System</h1>
          <p className="mt-1 text-sm text-text-secondary">Sign in to continue.</p>
        </div>

        <div>
          <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary block mb-1" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-elevated border border-border rounded px-3 py-2 text-sm text-text-primary"
          />
        </div>

        <div>
          <label className="text-[11px] font-black uppercase tracking-wider text-text-secondary block mb-1" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-elevated border border-border rounded px-3 py-2 text-sm text-text-primary"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-black py-2 rounded-lg transition-colors"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>

        <div className="pt-4 border-t border-border space-y-3">
          <div className="text-center">
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
              Dev Bypass Options
            </span>
            <p className="mt-1 text-[11px] text-text-secondary">No password required. Select a role to log in locally:</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['Depot Manager', 'Invoice Clerk', 'Yard Counter'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  localStorage.setItem('bypass_auth_role', role);
                  window.location.reload();
                }}
                className="py-1.5 px-1 bg-surface-elevated hover:bg-surface-elevated/80 border border-border hover:border-amber-500/50 rounded text-[11px] font-medium text-text-primary hover:text-amber-500 transition-all text-center leading-tight"
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

