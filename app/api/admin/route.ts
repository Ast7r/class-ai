import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { adminUsername, action, targetUsername, newPassword } = await req.json();

    const { data: adminUser } = await supabaseAdmin
      .from('class_users')
      .select('is_admin')
      .eq('username', adminUsername)
      .single();

    if (!adminUser?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (action === 'list') {
      const { data } = await supabaseAdmin
        .from('class_users')
        .select('id, username, is_admin, is_registered, hwid')
        .order('username', { ascending: true });
      return NextResponse.json({ users: data || [] });
    }

    if (action === 'reset_hwid') {
      await supabaseAdmin
        .from('class_users')
        .update({ hwid: null })
        .eq('username', targetUsername);
      return NextResponse.json({ success: true });
    }

    if (action === 'reset_password') {
      if (!newPassword) {
        return NextResponse.json({ error: 'Enter a new password' }, { status: 400 });
      }
      await supabaseAdmin.rpc('admin_reset_password', {
        p_target_username: targetUsername,
        p_new_password: newPassword,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
