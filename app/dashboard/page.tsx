import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { LicenseActivation } from '@/components/LicenseActivation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Добавили hwid в запрос к базе данных
  const { data: profile } = await supabase
    .from('profiles')
    .select('uid, username, premium_until, hwid')
    .eq('id', user.id)
    .single();

  const dateObj = new Date(user.created_at);
  const createdAt = `${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getFullYear()}`;

  // Обрезаем HWID, если он слишком длинный, для красоты
  const displayHwid = profile?.hwid 
    ? `${profile.hwid.substring(0, 10)}...` 
    : 'Не привязан';

  return (
    <div className="dashboard-page">
      <Navbar isDashboard={true} />

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="sidebar-profile">
            <div className="profile-avatar">
              {profile?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <strong>{profile?.username || 'User'}</strong>
              <small>UID: #{profile?.uid || '...'}</small>
            </div>
          </div>

          <div className="sidebar-label">MAIN</div>
          
          <Link href="/dashboard" className="sidebar-link active">Dashboard</Link>
          <Link href="/settings" className="sidebar-link">Settings</Link>
          
          <div className="sidebar-bottom">
            <Link href="/pricing" className="sidebar-link">Upgrade Plan</Link>
          </div>
        </aside>

        <main className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <div className="dashboard-eyebrow">ACCOUNT OVERVIEW</div>
              <h1>Добро пожаловать!</h1>
            </div>
            <div className="online-status">Online</div>
          </div>

          <section className="dashboard-section">
            <div className="section-heading">
              <h2>Данные аккаунта</h2>
              <span className="verified-badge">Verified</span>
            </div>
            
            <div className="account-grid">
              <div className="account-field">
                <span>Ваш UID (числовой)</span>
                <strong style={{ color: 'var(--accent)', fontSize: '18px' }}>
                  #{profile?.uid || 'Загрузка...'}
                </strong>
              </div>
              <div className="account-field">
                <span>Имя пользователя</span>
                <strong>{profile?.username || 'Без имени'}</strong>
              </div>
              <div className="account-field">
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>
              <div className="account-field">
                <span>Дата регистрации</span>
                <strong>{createdAt}</strong>
              </div>
              
              {/* НОВЫЙ БЛОК С HWID */}
              <div className="account-field" style={{ gridColumn: '1 / -1' }}>
                <span>HWID (Привязка к ПК)</span>
                <strong style={{ color: profile?.hwid ? 'var(--text)' : 'var(--muted)' }}>
                  {displayHwid}
                </strong>
              </div>
            </div>
          </section>

          <section className="dashboard-section">
            <div className="section-heading">
              <h2>Ваша лицензия</h2>
            </div>
            
            <LicenseActivation 
              uid={profile?.uid || 0} 
              currentPremiumUntil={profile?.premium_until} 
            />
            
            <p className="dashboard-message">* Введите ключ, полученный после покупки подписки, чтобы активировать Premium.</p>
          </section>
        </main>
      </div>
    </div>
  );
}