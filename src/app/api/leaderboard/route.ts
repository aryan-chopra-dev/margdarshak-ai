import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('name, lrs_score')
      .order('lrs_score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Leaderboard fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    return NextResponse.json({ status: 'success', data: profiles });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
