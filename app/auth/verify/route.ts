import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Используем Service Role Key для серверных запросов (обходит RLS)
// ОБЯЗАТЕЛЬНО добавь его в .env.local как SUPABASE_SERVICE_ROLE_KEY (без NEXT_PUBLIC_)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { licenseKey, hwid } = await req.json();

    if (!licenseKey || !hwid) {
      return NextResponse.json({ error: 'Missing licenseKey or hwid' }, { status: 400 });
    }

    // 1. Ищем пользователя по ключу лицензии
    // (В нашем случае ключ генерируется как FREE-TIER-UID, вытаскиваем UID)
    let uid;
    if (licenseKey.startsWith('FREE-TIER-')) {
      uid = parseInt(licenseKey.replace('FREE-TIER-', ''), 10);
    } else if (licenseKey.startsWith('PREMIUM-')) {
      uid = parseInt(licenseKey.replace('PREMIUM-', ''), 10);
    } else {
      return NextResponse.json({ error: 'Invalid license format' }, { status: 400 });
    }

    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, uid, username, hwid')
      .eq('uid', uid)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    // 2. Проверяем HWID
    if (profile.hwid && profile.hwid !== hwid) {
      return NextResponse.json({ 
        error: 'HWID mismatch', 
        message: 'Этот аккаунт привязан к другому компьютеру. Обратитесь в поддержку для сброса.' 
      }, { status: 403 });
    }

    // 3. Если HWID пустой — привязываем его к аккаунту (первый запуск)
    if (!profile.hwid) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ hwid: hwid, hwid_updated_at: new Date().toISOString() })
        .eq('uid', uid);

      if (updateError) {
        return NextResponse.json({ error: 'Failed to bind HWID' }, { status: 500 });
      }
    }

    // 4. Все ок! Выдаем токен (в реальном проекте тут нужно генерировать JWT)
    // Для простоты примера мы просто возвращаем успех и данные юзера
    return NextResponse.json({
      success: true,
      message: 'Auth successful',
      user: {
        uid: profile.uid,
        username: profile.username,
        role: licenseKey.startsWith('PREMIUM') ? 'premium' : 'free'
      },
      // Позже здесь можно передать сгенерированный JWT для сессии в Java
      token: 'FAKE_JWT_TOKEN_FOR_NOW' 
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}