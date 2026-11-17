import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, password, hwid } = await req.json();

    if (!email || !password || !hwid) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }

    // 1. Проверяем логин и пароль
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Неверный Email или пароль' }, { status: 401 });
    }

    // 2. Получаем профиль
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 });
    }

    // 3. Проверяем лицензию
    const { data: license } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .eq('used_by', authData.user.id)
      .limit(1)
      .single();

    if (!license) {
      return NextResponse.json({ error: 'У вас нет активной лицензии' }, { status: 403 });
    }

    // 4. Проверяем HWID
    if (profile.hwid && profile.hwid !== hwid) {
      return NextResponse.json({ error: 'Аккаунт привязан к другому ПК' }, { status: 403 });
    }

    if (!profile.hwid) {
      await supabaseAdmin
        .from('profiles')
        .update({ hwid: hwid, hwid_updated_at: new Date().toISOString() })
        .eq('id', authData.user.id);
    }

    // 5. Возвращаем данные, включая срок подписки
    return NextResponse.json({
      success: true,
      user: {
        uid: profile.uid,
        username: profile.username,
        premium_until: profile.premium_until, // Передаем дату
        is_lifetime: license.duration_days === -1 // Передаем флаг "навсегда"
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}