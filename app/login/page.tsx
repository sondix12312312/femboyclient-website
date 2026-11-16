'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function translateAuthError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Неверный email или пароль';
  if (m.includes('email not confirmed')) return 'Подтвердите email перед входом';
  if (m.includes('rate limit') || m.includes('too many')) return 'Слишком много попыток. Попробуйте позже';
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(translateAuthError(signInError.message));
      setLoading(false);
      return;
    }

    // Редирект в личный кабинет
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="auth-page">
      <nav className="navbar">
        <Link href="/" className="logo">
          <span className="logo-icon">✦</span>
          FemboyClient
        </Link>

        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
        </div>

        <div className="nav-actions">
          <Link href="/register" className="login-btn">
            Register
          </Link>
        </div>
      </nav>

      <div className="auth-container">
        <section className="auth-card">
          <div className="auth-icon">✦</div>

          <span className="auth-eyebrow">WELCOME BACK</span>

          <h1>Sign In</h1>

          <p className="auth-subtitle">
            Sign in to your FemboyClient account and continue your experience.
          </p>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                marginBottom: '16px',
                borderRadius: '10px',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: '#fecaca',
                fontSize: '13px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="email">EMAIL</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <label htmlFor="password">PASSWORD</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'} <span>→</span>
            </button>
          </form>

          <div className="auth-divider">NEW TO FEMBOYCLIENT?</div>

          <Link href="/register" className="auth-secondary">
            Create Account
          </Link>

          <div className="auth-footer">
            <span>FEMBOYCLIENT</span>
            <span>PREMIUM EXPERIENCE</span>
          </div>
        </section>
      </div>
    </main>
  );
}