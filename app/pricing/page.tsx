'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { CheckoutModal } from '@/components/CheckoutModal';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const plans = [
    {
      id: '30days',
      name: '30 Days',
      price: '199',
      days: '30 дней',
      desc: 'Идеально для теста или игры на каникулах.',
      features: ['Доступ на 30 дней', 'Все модули клиента', 'Поддержка 24/7', 'Регулярные обновления'],
    },
    {
      id: '90days',
      name: '90 Days',
      price: '299',
      days: '90 дней',
      desc: 'Оптимальный выбор для постоянной игры.',
      features: ['Доступ на 90 дней', 'Все модули клиента', 'Поддержка 24/7', 'Регулярные обновления', 'Приоритетная поддержка'],
      featured: true,
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: '399',
      days: 'Навсегда',
      desc: 'Один раз заплати — играй вечно.',
      features: ['Вечный доступ', 'Все модули клиента', 'Поддержка 24/7', 'Регулярные обновления', 'Приоритетная поддержка', 'Доступ к новым фичам'],
    },
  ];

  return (
    <div className="pricing-page">
      <Navbar />

      <div className="pricing-content">
        <h1>Выберите свой план</h1>
        <p>Премиальный доступ к FemboyClient. Никаких скрытых платежей, только чистый геймплей.</p>

        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.id} className={`plan-card ${plan.featured ? 'featured' : ''}`}>
              {plan.featured && <span className="featured-badge">Популярный</span>}
              <h2>{plan.name}</h2>
              <p>{plan.desc}</p>
              
              <div className="plan-price">
                {plan.price}₽ <span>/ {plan.days}</span>
              </div>

              <ul>
                {plan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>

              <button 
                className="plan-button"
                onClick={() => setSelectedPlan(plan)}
              >
                Купить
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <CheckoutModal 
          isOpen={!!selectedPlan} 
          onClose={() => setSelectedPlan(null)} 
          plan={selectedPlan} 
        />
      )}
    </div>
  );
}