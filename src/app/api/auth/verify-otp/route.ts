import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email, phone, otp, name } = await req.json();

    if (!email || !phone || !otp) {
      return NextResponse.json({ error: 'Email, phone, and OTP are required.' }, { status: 400 });
    }

    // Look up OTP from Supabase
    const { data: otpRecord, error: fetchErr } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('phone', phone)
      .single();

    if (fetchErr || !otpRecord) {
      return NextResponse.json({ error: 'OTP not found. Please request a new one.' }, { status: 400 });
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 });
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      await supabase.from('otp_verifications').delete().eq('id', otpRecord.id);
      return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 });
    }

    // OTP valid — delete it (one-time use)
    await supabase.from('otp_verifications').delete().eq('id', otpRecord.id);

    // Upsert user profile in Supabase
    const profileName = name || 'Student';
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .upsert(
        { email, phone, name: profileName, updated_at: new Date().toISOString() },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (profileErr) {
      console.error('Profile upsert error:', profileErr);
      return NextResponse.json({ error: 'Failed to create profile.' }, { status: 500 });
    }

    // Set session cookie (Next.js 16: cookies() is async)
    const cookieStore = await cookies();

    cookieStore.set('auth-token', profile.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    cookieStore.set('user-info', JSON.stringify({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      message: 'Verified successfully.',
      profile: { id: profile.id, name: profile.name, email: profile.email, phone: profile.phone },
    });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json({ error: 'Verification failed.' }, { status: 500 });
  }
}
