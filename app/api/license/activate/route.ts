import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { licenseKey, userId } = await req.json();

    if (!licenseKey || !userId) {
      return NextResponse.json({ error: 'Введите ключ' }, { status: 400 });
    }

    // 1. Ищем ключ
    const { data: license, error: findErr } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey.trim().toUpperCase())
      .single();

    if (findErr || !license) {
      return NextResponse.json({ error: 'Ключ не найден' }, { status: 404 });
    }

    if (license.is_used) {
      return NextResponse.json({ error: 'Ключ уже был активирован' }, { status: 400 });
    }

    // 2. Считаем дату окончания
    let premiumUntil = null;
    if (license.duration_days !== -1) {
      const date = new Date();
      date.setDate(date.getDate() + license.duration_days);
      premiumUntil = date.toISOString();
    }

    // 3. Обновляем профиль пользователя
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update({ premium_until: premiumUntil })
      .eq('id', userId);

    if (profileErr) throw profileErr;

    // 4. Отмечаем ключ как использованный
    await supabaseAdmin
      .from('licenses')
      .update({ is_used: true, used_by: userId, used_at: new Date().toISOString() })
      .eq('id', license.id);

    return NextResponse.json({ success: true, duration: license.duration_days });
  } catch (err: any) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}