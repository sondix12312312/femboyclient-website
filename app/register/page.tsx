'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function translateAuthError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('user already registered')) return 'Этот email уже зарегистрирован';
  if (m.includes('password should be at least')) return 'Пароль слишком короткий';
  if (m.includes('unable to validate email')) return 'Некорректный email';
  if (m.includes('rate limit') || m.includes('too many')) return 'Слишком много попыток. Попробуйте позже';
  if (m.includes('signups not allowed')) return 'Регистрация временно отключена';
  return raw;
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен быть минимум 8 символов');
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.trim(),
        },
      },
    });

    if (signUpError) {
      setError(translateAuthError(signUpError.message));
      setLoading(false);
      return;
    }

    // Проверка на то, что email уже занят (при включенном Confirm email)
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setError('Этот email уже зарегистрирован');
      setLoading(false);
      return;
    }

    // Если Confirm email выключен — сессия создана, редиректим в кабинет
    if (data.session) {
      router.push('/dashboard');
      router.refresh();
      return;
    }

    // Если Confirm email включён — просим подтвердить почту.
    setSuccess('Аккаунт создан! Проверьте почту и подтвердите email, затем войдите.');
    setLoading(false);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
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
          <Link href="/login" className="login-btn">
            Login
          </Link>
        </div>
      </nav>

      <div className="auth-container">
        <section className="auth-card">
          <div className="auth-icon">✦</div>

          <span className="auth-eyebrow">FEMBOYCLIENT ACCOUNT</span>

          <h1>Create Account</h1>

          <p className="auth-subtitle">
            Join FemboyClient and unlock your premium Minecraft experience.
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

          {success && (
            <div
              style={{
                padding: '10px 14px',
                marginBottom: '16px',
                borderRadius: '10px',
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.35)',
                color: '#bbf7d0',
                fontSize: '13px',
                textAlign: 'center',
              }}
            >
              {success}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="username">USERNAME</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              minLength={3}
              maxLength={24}
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />

            <label htmlFor="email">EMAIL ADDRESS</label>
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
              placeholder="Create a password"
              minLength={8}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              minLength={8}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'} <span>→</span>
            </button>
          </form>

          <div className="auth-divider">ALREADY HAVE AN ACCOUNT?</div>

          <Link href="/login" className="auth-secondary">
            Sign In
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