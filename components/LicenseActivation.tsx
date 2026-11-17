'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function LicenseActivation({ uid, currentPremiumUntil }: { uid: number, currentPremiumUntil: string | null }) {
  const router = useRouter();
  const supabase = createClient();
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Определяем статус
  const isPremium = currentPremiumUntil === 'lifetime' || (currentPremiumUntil && new Date(currentPremiumUntil) > new Date());
  
  let statusText = 'Бесплатный (Free)';
  let keyDisplay = `FREE-TIER-${uid}`;

  if (currentPremiumUntil === 'lifetime') {
    statusText = 'Lifetime Premium';
    keyDisplay = `PREMIUM-LIFETIME-${uid}`;
  } else if (isPremium) {
    const dateStr = new Date(currentPremiumUntil!).toLocaleDateString('ru-RU');
    statusText = `Premium (до ${dateStr})`;
    keyDisplay = `PREMIUM-KEY-${uid}`;
  }

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const res = await fetch('/api/license/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: key, userId: user.id })
    });

    const data = await res.json();

    if (data.success) {
      router.refresh(); // Обновляем страницу, чтобы подтянуть новые данные
    } else {
      setError(data.error);
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="license-box">
        <div className="license-details">
          <span>СТАТУС ПОДПИСКИ</span>
          <strong style={{ color: isPremium ? 'var(--success)' : 'var(--text)' }}>
            {statusText}
          </strong>
        </div>
        <button 
          className="copy-field"
          onClick={() => navigator.clipboard.writeText(keyDisplay)}
        >
          Копировать ID лицензии
        </button>
      </div>

      {!isPremium && (
        <form className="license-activation-form" onSubmit={handleActivate}>
          <input
            type="text"
            className="license-input"
            placeholder="Введите ключ (FBC-XXXX-XXXX-XXXX)..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={loading}
            required
          />
          <button type="submit" className="license-activate-btn" disabled={loading || !key.trim()}>
            {loading ? 'Проверка...' : 'Активировать'}
          </button>
        </form>
      )}

      {error && <p style={{ color: '#fecaca', fontSize: '12px', marginTop: '10px' }}>{error}</p>}
      
      {isPremium && (
        <p style={{ color: 'var(--success)', fontSize: '12px', marginTop: '10px' }}>
          ✓ У вас активирована Premium-подписка. Спасибо за поддержку!
        </p>
      )}
    </div>
  );
}