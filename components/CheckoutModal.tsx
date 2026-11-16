'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: string;
    days: string;
  };
}

export function CheckoutModal({ isOpen, onClose, plan }: CheckoutModalProps) {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [promo, setPromo] = useState('');
  const [loading, setLoading] = useState(false);

  // Автоматически подставляем email текущего пользователя
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        setEmail(data.user.email);
      }
    }
    if (isOpen) getUser();
  }, [isOpen, supabase]);

  if (!isOpen) return null;

  // Ссылки на твои лоты FunPay
  const funpayLinks: Record<string, string> = {
    '30days': 'https://funpay.com/lots/offer?id=82373433',
    '90days': 'https://funpay.com/lots/offer?id=82373636',
    'lifetime': 'https://funpay.com/lots/offer?id=82373597',
  };

  const handlePay = () => {
    setLoading(true);
    // Перекидываем пользователя на оплату в FunPay
    const url = funpayLinks[plan.id];
    if (url) {
      window.open(url, '_blank');
    }
    setLoading(false);
  };

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="checkout-close" onClick={onClose}>×</button>
        
        <h2 className="checkout-title">Оплата</h2>

        <div className="checkout-item">
          <span className="checkout-plan">FemboyClient — {plan.days}</span>
          <span className="checkout-price">{plan.price}₽</span>
        </div>

        <div className="checkout-section-label">Способ оплаты</div>
        
        {/* Кнопка оплаты через FunPay */}
        <button className="checkout-pay-btn" onClick={handlePay}>
          <div className="funpay-icon">F</div>
          <span>FunPay</span>
        </button>

        <div className="checkout-input-group">
          <div className="checkout-section-label">Email для получения ключа</div>
          <input 
            type="email" 
            className="checkout-input" 
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="checkout-promo-row">
          <input 
            type="text" 
            className="checkout-promo-input" 
            placeholder="Введите промокод"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
          />
          <button className="checkout-promo-btn">Применить</button>
        </div>

        <button 
          className="checkout-submit" 
          onClick={handlePay}
          disabled={loading || !email}
        >
          {loading ? 'Переход...' : 'Оплатить'}
        </button>
      </div>
    </div>
  );
}