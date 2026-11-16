'use client';

import { useState } from 'react';

export function LicenseActivation({ uid }: { uid: number | string }) {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'free' | 'premium'>('free');
  const [error, setError] = useState<string | null>(null);

  const currentKey = status === 'premium' ? `PREMIUM-${uid}` : `FREE-TIER-${uid || '000'}`;

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Имитация запроса к серверу (задержка 1 секунда)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Для теста: если ключ содержит "PREMIUM" — активируем
    if (key.trim().toUpperCase() === 'PREMIUM' || key.trim().toUpperCase() === 'PRO') {
      setStatus('premium');
      setKey('');
    } else {
      setError('Неверный или уже использованный ключ.');
    }
    
    setLoading(false);
  }

  return (
    <div>
      <div className="license-box">
        <div className="license-details">
          <span>LICENSE KEY</span>
          <strong style={{ color: status === 'premium' ? 'var(--success)' : 'var(--text)' }}>
            {currentKey}
          </strong>
        </div>
        <button 
          className="copy-field"
          onClick={() => {
            navigator.clipboard.writeText(currentKey);
          }}
        >
          Копировать
        </button>
      </div>

      {status === 'free' && (
        <form className="license-activation-form" onSubmit={handleActivate}>
          <input
            type="text"
            className="license-input"
            placeholder="Введите ключ активации..."
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

      {error && (
        <p style={{ color: '#fecaca', fontSize: '12px', marginTop: '10px' }}>{error}</p>
      )}

      {status === 'premium' && (
        <p style={{ color: 'var(--success)', fontSize: '12px', marginTop: '10px' }}>
          ✓ Премиум-подписка успешно активирована!
        </p>
      )}
    </div>
  );
}