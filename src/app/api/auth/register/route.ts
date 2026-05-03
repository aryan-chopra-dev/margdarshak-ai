import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Register Route — Unified on Supabase Postgres
// ============================================================================
// [FIX NEW-3]: Previously used Prisma/SQLite while verify-otp used Supabase.
// Now unified on the same Supabase 'profiles' table.
// ============================================================================

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Upsert user profile into Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert(
        { email, name: name || 'User', updated_at: new Date().toISOString() },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase register upsert error:', error);
      return NextResponse.json({ status: 'error', message: 'Auth processing failed' }, { status: 500 });
    }

    console.log('\n--- 🟢 USER AUTHENTICATED & SAVED TO DB ---');
    console.log(`Name: ${profile.name}`);
    console.log(`Email: ${profile.email}`);
    console.log('----------------------------------------------------\n');

    return NextResponse.json({
      status: 'success',
      profile,
      message: 'Authentication successful and profile saved.',
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ status: 'error', message: 'Auth processing failed' }, { status: 500 });
  }
}
