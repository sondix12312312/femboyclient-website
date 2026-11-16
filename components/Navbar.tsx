'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface NavbarProps {
  isDashboard?: boolean;
}

export function Navbar({ isDashboard = false }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Получаем текущую сессию при загрузке
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user?.user_metadata?.username) {
        setUsername(user.user_metadata.username);
      }
    };
    getUser();

    // Слушаем изменения (вход/выход)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setUsername(session?.user?.user_metadata?.username ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <nav className="navbar">
      <Link href="/" className="logo">
        <span>✦</span> FemboyClient
      </Link>

      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/documents">Documents</Link>
      </div>

      <div className="nav-actions">
        {isDashboard ? (
          // Если мы на странице кабинета
          <Link href="/dashboard" className="nav-button">Dashboard</Link>
        ) : user ? (
          // Если пользователь авторизован (на главной), показываем его НИК
          <Link href="/dashboard" className="nav-button" style={{ textTransform: 'capitalize' }}>
            {username || 'Профиль'}
          </Link>
        ) : (
          // Если не авторизован
          <>
            <Link href="/login" className="login-btn">
              Sign in
            </Link>
            <Link href="/register" className="nav-button">
              Get started ↗
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}