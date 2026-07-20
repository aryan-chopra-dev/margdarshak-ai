import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const { loanId, action } = await req.json();

    if (!loanId || !action) {
      return NextResponse.json({ error: 'Loan ID and action are required' }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action. Choose approve or reject.' }, { status: 400 });
    }

    const statusValue = action === 'approve' ? 'approved' : 'rejected';

    const { error } = await supabase
      .from('loan_applications')
      .update({
        status: statusValue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', loanId);

    if (error) {
      console.error('Failed to update loan action:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ status: 'success', message: `Loan ${action}d successfully.` });

  } catch (error) {
    console.error('Admin Loan Action API Error:', error);
    return NextResponse.json({ error: 'Failed to process admin action' }, { status: 500 });
  }
}
