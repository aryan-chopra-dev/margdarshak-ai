import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const { email, phone, otp, name, isLogin } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 });
    }

    if (!isLogin && !phone) {
      return NextResponse.json({ error: 'Mobile number is required for registration.' }, { status: 400 });
    }

    // Look up OTP from Supabase (by email only)
    const { data: otpRecord, error: fetchErr } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .maybeSingle();

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

    let profile: any = null;

    if (!isLogin) {
      // 1. REGISTRATION: Create profiles record
      const profileName = name || 'Student';
      const { data: newProfile, error: profileErr } = await supabase
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
      profile = newProfile;

      // 2. Initialize academic scores for new user
      const { error: scoresErr } = await supabase
        .from('academic_scores')
        .upsert(
          { profile_id: profile.id, gpa: 0, gre_score: 0, toefl_score: 0, ielts_score: 0, work_experience: 0, lrs_score: 300, intent_score: 0 },
          { onConflict: 'profile_id' }
        );

      if (scoresErr) {
        console.error('Academic scores initialization error:', scoresErr);
      }

      // 3. Initialize study targets for new user
      const { error: targetsErr } = await supabase
        .from('study_targets')
        .upsert(
          { profile_id: profile.id, stage: 'explorer', budget: 0 },
          { onConflict: 'profile_id' }
        );

      if (targetsErr) {
        console.error('Study targets initialization error:', targetsErr);
      }
    } else {
      // 2. LOGIN: Fetch existing user profile
      const { data: existingProfile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileErr || !existingProfile) {
        console.error('Profile login fetch error:', profileErr);
        return NextResponse.json({ error: 'Failed to retrieve profile.' }, { status: 404 });
      }
      profile = existingProfile;

      // Safe fallback: Initialize academic_scores if missing
      const { data: existingScores } = await supabase.from('academic_scores').select('id').eq('profile_id', profile.id).maybeSingle();
      if (!existingScores) {
        await supabase.from('academic_scores').insert({ profile_id: profile.id });
      }
      // Safe fallback: Initialize study_targets if missing
      const { data: existingTargets } = await supabase.from('study_targets').select('id').eq('profile_id', profile.id).maybeSingle();
      if (!existingTargets) {
        await supabase.from('study_targets').insert({ profile_id: profile.id });
      }
    }

    // OTP valid and profile verified — delete the OTP record now (one-time use)
    await supabase.from('otp_verifications').delete().eq('id', otpRecord.id);

    if (!isLogin) {
      return NextResponse.json({
        message: 'Account created successfully.',
        registered: true
      });
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
