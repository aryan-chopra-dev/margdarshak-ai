import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const { userId, action, updates } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 });
    }

    if (action === 'approve_role') {
      const { error } = await supabase
        .from('profiles')
        .update({
          role_status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return NextResponse.json({ status: 'success', message: 'Role approved successfully.' });
    }

    if (action === 'edit_profile') {
      if (!updates) {
        return NextResponse.json({ error: 'Updates payload is required for edit_profile' }, { status: 400 });
      }

      // Check phone number format if updated
      if (updates.phone !== undefined && updates.phone !== null && updates.phone !== '') {
        const cleanPhone = updates.phone.replace(/[\s\-\+]/g, '');
        const last10 = cleanPhone.slice(-10);
        if (last10.length !== 10 || !/^[6-9]\d{9}$/.test(last10)) {
          return NextResponse.json({ status: 'error', message: 'Please enter a valid 10-digit Indian phone number.' }, { status: 400 });
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return NextResponse.json({ status: 'success', message: 'Profile updated successfully.' });
    }

    if (action === 'delete_profile') {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return NextResponse.json({ status: 'success', message: 'Profile deleted successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Admin User Action API Error:', error);
    return NextResponse.json({ error: 'Failed to process user action' }, { status: 500 });
  }
}
