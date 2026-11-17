import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Функция генерации случайного ключа (FBC-XXXX-XXXX-XXXX)
function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `FBC-${segment()}-${segment()}-${segment()}`;
}

export async function POST(req: NextRequest) {
  try {
    const { duration_days } = await req.json();
    const key = generateKey();

    const { error } = await supabaseAdmin
      .from('licenses')
      .insert([{ license_key: key, duration_days }]);

    if (error) throw error;

    return NextResponse.json({ success: true, key });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}