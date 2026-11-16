'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        padding: '11px 18px',
        borderRadius: '9px',
        border: '1px solid var(--border)',
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#fecaca',
        fontWeight: 700,
        fontSize: '14px',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: '0.2s ease',
      }}
    >
      {loading ? 'Выход...' : 'Выйти'}
    </button>
  );
}