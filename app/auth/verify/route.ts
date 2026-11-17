import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { licenseKey, hwid } = await req.json();

    if (!licenseKey || !hwid) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 1. Ищем ключ в базе данных
    const { data: license, error: licError } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey.trim().toUpperCase())
      .single();

    if (licError || !license) {
      return NextResponse.json({ error: 'Ключ не найден в базе' }, { status: 404 });
    }

    // 2. Проверяем, активирован ли он на сайте (привязан ли к аккаунту)
    if (!license.used_by) {
      return NextResponse.json({ 
        error: 'Сначала активируйте этот ключ на сайте femboyclient.fun в личном кабинете!' 
      }, { status: 403 });
    }

    // 3. Получаем профиль пользователя, который активировал ключ
    const { data: profile, error: profError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', license.used_by)
      .single();

    if (profError || !profile) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // 4. Проверяем HWID (привязку к компу)
    if (profile.hwid && profile.hwid !== hwid) {
      return NextResponse.json({ 
        error: 'HWID mismatch',
        message: 'Этот ключ привязан к другому компьютеру. Обратитесь в поддержку.' 
      }, { status: 403 });
    }

    // Если HWID пустой — привязываем его к аккаунту
    if (!profile.hwid) {
      await supabaseAdmin
        .from('profiles')
        .update({ hwid: hwid, hwid_updated_at: new Date().toISOString() })
        .eq('id', license.used_by);
    }

    // 5. Проверяем, не истекла ли подписка
    if (profile.premium_until && new Date(profile.premium_until) < new Date()) {
       return NextResponse.json({ error: 'Срок действия подписки истек' }, { status: 403 });
    }

    // Всё отлично, пускаем в игру
    return NextResponse.json({
      success: true,
      user: {
        uid: profile.uid,
        username: profile.username
      },
      token: 'FAKE_JWT_TOKEN_FOR_NOW'
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}