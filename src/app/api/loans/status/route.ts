import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: loan, error: loanErr } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (loanErr) {
      console.error('Failed to fetch loan application:', loanErr);
      return NextResponse.json({ error: 'Failed to fetch loan application' }, { status: 500 });
    }

    if (!loan) {
      return NextResponse.json({ loan: null });
    }

    return NextResponse.json({
      loan: {
        submitted: true,
        lenderId: loan.lender_id,
        lenderName: loan.lender_name,
        universityName: loan.university_name,
        principalINR: Number(loan.principal_inr),
        submittedAt: loan.submitted_at,
        referenceId: loan.reference_id,
        status: loan.status,
      }
    });

  } catch (error) {
    console.error('Loan Status API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}
