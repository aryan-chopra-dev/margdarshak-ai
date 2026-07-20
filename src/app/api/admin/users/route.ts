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

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        *,
        academic_scores!left(*),
        study_targets!left(*),
        co_applicants!left(*),
        documents!left(*),
        shortlisted_universities!left(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch admin profiles:', error);
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }

    // Map each profile back to CamelCase UserProfile
    const formatted = profiles.map((profileRow: any) => {
      const scores  = profileRow.academic_scores || {};
      const targets = profileRow.study_targets || {};
      const parent  = profileRow.co_applicants || {};
      const docs    = Array.isArray(profileRow.documents) ? profileRow.documents.map((d: any) => d.name) : [];
      const unis    = Array.isArray(profileRow.shortlisted_universities) ? profileRow.shortlisted_universities.map((u: any) => u.university_name) : [];

      return {
        id:                      profileRow.id,
        email:                   profileRow.email,
        name:                    profileRow.name,
        phone:                   profileRow.phone || '',
        stage:                   targets.stage || 'explorer',
        targetCountry:           targets.target_country || '',
        targetField:             targets.target_field || '',
        degree:                  targets.degree || 'masters',
        budget:                  targets.budget || 0,
        gpa:                     scores.gpa || 0,
        greScore:                scores.gre_score || 0,
        toeflScore:              scores.toefl_score || 0,
        ieltsScore:              scores.ielts_score || 0,
        workExperience:          scores.work_experience || 0,
        hasResearch:             scores.has_research || false,
        lrsScore:                scores.lrs_score || 300,
        intentScore:             scores.intent_score || 0,
        parentName:              parent.name || '',
        parentPhone:             parent.phone || '',
        parentIncome:            parent.income || 0,
        parentOccupation:        parent.occupation || '',
        docsUploaded:            docs,
        shortlistedUniversities: unis,
        kycVerified:             profileRow.kyc_verified || false,
        role:                    profileRow.role || 'user',
        roleStatus:              profileRow.role_status || 'approved',
      };
    });

    return NextResponse.json({ status: 'success', users: formatted });

  } catch (error) {
    console.error('Get Users Admin Route Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users list' }, { status: 500 });
  }
}
