import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { action, username, password, hwid } = await req.json();

    if (!username || !password || !hwid) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (action === 'register') {
      const { data: userCheck } = await supabaseAdmin
        .from('class_users')
        .select('is_registered, is_admin')
        .eq('username', username)
        .single();

      if (!userCheck) {
        return NextResponse.json(
          { error: 'Invalid class username. Use all lowercase (e.g. amarsanaa01).' },
          { status: 404 }
        );
      }
      if (userCheck.is_registered || userCheck.is_admin) {
        return NextResponse.json(
          { error: 'This account is already registered. Switch to Login.' },
          { status: 400 }
        );
      }

      const { data: success, error } = await supabaseAdmin.rpc('register_student', {
        p_username: username,
        p_password: password,
        p_hwid: hwid,
      });

      if (error || !success) {
        return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
      }

      return NextResponse.json({ username, is_admin: false });
    }

    if (action === 'login') {
      const { data, error } = await supabaseAdmin.rpc('verify_user_login', {
        p_username: username,
        p_password: password,
      });

      if (error || !data || data.length === 0) {
        return NextResponse.json({ error: 'Wrong username or password.' }, { status: 401 });
      }

      const user = data[0];

      if (!user.is_admin) {
        if (!user.hwid) {
          await supabaseAdmin.from('class_users').update({ hwid }).eq('id', user.id);
        } else if (user.hwid !== hwid) {
          return NextResponse.json(
            { error: 'Device Locked (HWID Mismatch). Ask Temuulen (Ast7r) to reset your HWID.' },
            { status: 403 }
          );
        }
      }

      return NextResponse.json({ username: user.username, is_admin: user.is_admin });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
