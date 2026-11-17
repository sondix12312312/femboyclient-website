'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        router.push('/dashboard'); // Выкидываем не-админов
      } else {
        setLoading(false);
      }
    }
    checkAdmin();
  }, [router, supabase]);

  async function handleGenerate(days: number) {
    setIsGenerating(true);
    setGeneratedKey(null);

    const res = await fetch('/api/admin/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration_days: days })
    });
    const data = await res.json();
    
    if (data.success) setGeneratedKey(data.key);
    else alert('Ошибка генерации: ' + data.error);

    setIsGenerating(false);
  }

  if (loading) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>Проверка прав...</div>;

  return (
    <div className="dashboard-page">
      <Navbar isDashboard={true} />
      <div className="dashboard-layout" style={{ gridTemplateColumns: '1fr' }}>
        <main className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <div className="dashboard-eyebrow">ADMINISTRATOR ONLY</div>
              <h1>Генерация ключей</h1>
            </div>
          </div>

          <section className="dashboard-section">
            <div className="section-heading">
              <h2>Создать новый ключ</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button className="plan-button" onClick={() => handleGenerate(30)} disabled={isGenerating}>
                Сгенерировать на 30 дней
              </button>
              <button className="plan-button" onClick={() => handleGenerate(90)} disabled={isGenerating}>
                Сгенерировать на 90 дней
              </button>
              <button className="plan-button" onClick={() => handleGenerate(-1)} disabled={isGenerating}>
                Сгенерировать Lifetime
              </button>
            </div>

            {generatedKey && (
              <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                <p style={{ color: 'var(--muted)', marginBottom: '10px' }}>Ключ успешно создан (скопируйте его):</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '24px', letterSpacing: '2px', color: 'var(--accent)' }}>{generatedKey}</strong>
                  <button 
                    className="copy-field"
                    onClick={() => navigator.clipboard.writeText(generatedKey)}
                  >
                    Копировать
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}