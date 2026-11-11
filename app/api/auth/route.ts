import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 🛠️ MASTER DEVELOPER BYPASS
    if (username === 'ast7r' && password === 'mantuunbuuz') {
      return NextResponse.json({
        success: true,
        user: { id: 'ast7r-admin', username: 'ast7r', role: 'admin' }
      });
    }

    // Fallback database lookup for your classmates
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user || user.password !== password) {
      return NextResponse.json({ success: false, error: 'Wrong username or password.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role || 'student' }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal Authentication Error' }, { status: 500 });
  }
}
