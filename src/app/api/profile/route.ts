import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================================================================
// Profile API — Unified on Supabase Postgres
// ============================================================================
// Previously this route used Prisma/SQLite while verify-otp used Supabase,
// creating a split-brain where users created via OTP could never be found here.
// Now fully unified: all profile reads/writes go through the same Supabase
// 'profiles' table that verify-otp creates rows in. [FIX: NEW-3]
// ============================================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, ...updates } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Build the update payload — Supabase jsonb columns accept native arrays
    const updatePayload: Record<string, unknown> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Ensure arrays are passed as-is (Supabase handles jsonb natively)
    // but if they arrive as strings (legacy), parse them first
    if (typeof updatePayload.shortlistedUniversities === 'string') {
      try { updatePayload.shortlistedUniversities = JSON.parse(updatePayload.shortlistedUniversities as string); }
      catch { updatePayload.shortlistedUniversities = []; }
    }
    if (typeof updatePayload.docsUploaded === 'string') {
      try { updatePayload.docsUploaded = JSON.parse(updatePayload.docsUploaded as string); }
      catch { updatePayload.docsUploaded = []; }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('Profile Update Error (Supabase):', error);
      return NextResponse.json({ status: 'error', message: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ status: 'success', profile });

  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to update profile' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !profile) {
      // PGRST116 = no rows found — treat as 404
      if (error?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
      console.error('Profile Fetch Error (Supabase):', error);
      return NextResponse.json({ status: 'error', message: 'Failed to fetch profile' }, { status: 500 });
    }

    // Supabase jsonb columns return native arrays — no manual JSON.parse needed.
    // Normalise to arrays defensively in case of legacy string data.
    const parsedProfile = {
      ...profile,
      shortlistedUniversities: Array.isArray(profile.shortlistedUniversities)
        ? profile.shortlistedUniversities
        : (() => { try { return JSON.parse(profile.shortlistedUniversities || '[]'); } catch { return []; } })(),
      docsUploaded: Array.isArray(profile.docsUploaded)
        ? profile.docsUploaded
        : (() => { try { return JSON.parse(profile.docsUploaded || '[]'); } catch { return []; } })(),
    };

    return NextResponse.json({ status: 'success', profile: parsedProfile });

  } catch (error) {
    console.error('Profile Fetch Error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch profile' }, { status: 500 });
  }
}
