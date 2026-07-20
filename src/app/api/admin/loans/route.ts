import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    // Security check: we can verify if the requestor is an admin
    if (email) {
      const { data: requestor, error: reqErr } = await supabase
        .from('profiles')
        .select('role, role_status')
        .eq('email', email)
        .single();
      
      if (reqErr || !requestor || requestor.role !== 'admin' || (requestor.role_status !== 'approved' && process.env.NODE_ENV !== 'development')) {
        return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 403 });
      }
    }

    const { data: loans, error } = await supabase
      .from('loan_applications')
      .select(`
        *,
        profiles!inner(
          name, 
          email, 
          phone,
          academic_scores!left(lrs_score),
          documents!left(name)
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch admin loans:', error);
      return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
    }

    // Format fields
    const formatted = loans.map((loan: any) => ({
      id: loan.id,
      profileId: loan.profile_id,
      userName: loan.profiles?.name || 'Student',
      userEmail: loan.profiles?.email || '',
      userPhone: loan.profiles?.phone || '',
      lrsScore: loan.profiles?.academic_scores?.lrs_score || 300,
      lenderId: loan.lender_id,
      lenderName: loan.lender_name,
      universityName: loan.university_name,
      principalINR: Number(loan.principal_inr),
      status: loan.status,
      referenceId: loan.reference_id,
      submittedAt: loan.submitted_at,
      docsUploaded: Array.isArray(loan.profiles?.documents) ? loan.profiles.documents.map((d: any) => d.name) : [],
    }));

    return NextResponse.json({ status: 'success', loans: formatted });

  } catch (error) {
    console.error('Get Loans Admin Route Error:', error);
    return NextResponse.json({ error: 'Failed to fetch loans list' }, { status: 500 });
  }
}
