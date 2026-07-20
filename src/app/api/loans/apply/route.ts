import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const { email, lenderId, lenderName, universityName, principalINR, referenceId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Fetch user profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 2. Insert or upsert loan application
    const { error: loanErr } = await supabase
      .from('loan_applications')
      .upsert({
        profile_id: profile.id,
        lender_id: lenderId,
        lender_name: lenderName,
        university_name: universityName,
        principal_inr: principalINR,
        reference_id: referenceId,
        status: 'pending',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id' });

    if (loanErr) {
      console.error('Failed to save loan application:', loanErr);
      return NextResponse.json({ error: 'Failed to save loan application' }, { status: 500 });
    }

    return NextResponse.json({ status: 'success', message: 'Loan application submitted successfully.' });

  } catch (error) {
    console.error('Apply Loan API Error:', error);
    return NextResponse.json({ error: 'Failed to process application' }, { status: 500 });
  }
}
