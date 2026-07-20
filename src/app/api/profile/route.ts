import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';
import { calculateLRS, UserProfile } from '@/lib/store';

// ============================================================================
// Profile API — Unified & Normalized on Supabase Postgres
// ============================================================================

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await req.json();
    const { email, ...updates } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Validate fields before proceeding (defense-in-depth API level checks)
    if (updates.phone !== undefined && updates.phone !== null && updates.phone !== '') {
      const cleanPhone = updates.phone.replace(/[\s\-\+]/g, '');
      const last10 = cleanPhone.slice(-10);
      if (last10.length !== 10 || !/^[6-9]\d{9}$/.test(last10)) {
        return NextResponse.json({ status: 'error', message: 'Please enter a valid 10-digit Indian phone number.' }, { status: 400 });
      }
    }
    if (updates.parentPhone !== undefined && updates.parentPhone !== null && updates.parentPhone !== '') {
      const cleanPhone = updates.parentPhone.replace(/[\s\-\+]/g, '');
      const last10 = cleanPhone.slice(-10);
      if (last10.length !== 10 || !/^[6-9]\d{9}$/.test(last10)) {
        return NextResponse.json({ status: 'error', message: 'Please enter a valid 10-digit Indian parent phone number.' }, { status: 400 });
      }
    }
    if (updates.gpa !== undefined && (updates.gpa < 0 || updates.gpa > 10.0)) {
      return NextResponse.json({ status: 'error', message: 'GPA must be between 0.0 and 10.0.' }, { status: 400 });
    }
    if (updates.greScore !== undefined && updates.greScore !== 0 && (updates.greScore < 260 || updates.greScore > 340)) {
      return NextResponse.json({ status: 'error', message: 'GRE score must be 0 (if not taken) or between 260 and 340.' }, { status: 400 });
    }
    if (updates.toeflScore !== undefined && (updates.toeflScore < 0 || updates.toeflScore > 120)) {
      return NextResponse.json({ status: 'error', message: 'TOEFL score must be between 0 and 120.' }, { status: 400 });
    }
    if (updates.ieltsScore !== undefined && (updates.ieltsScore < 0.0 || updates.ieltsScore > 9.0)) {
      return NextResponse.json({ status: 'error', message: 'IELTS score must be between 0.0 and 9.0.' }, { status: 400 });
    }
    if (updates.workExperience !== undefined && (updates.workExperience < 0 || updates.workExperience > 30)) {
      return NextResponse.json({ status: 'error', message: 'Work experience must be between 0 and 30 years.' }, { status: 400 });
    }
    if (updates.parentIncome !== undefined && (updates.parentIncome < 0 || updates.parentIncome > 100000000)) {
      return NextResponse.json({ status: 'error', message: 'Parent income cannot exceed 100,000,000 INR.' }, { status: 400 });
    }
    if (updates.budget !== undefined && updates.budget < 0) {
      return NextResponse.json({ status: 'error', message: 'Budget must be greater than or equal to 0.' }, { status: 400 });
    }

    // 2. Fetch the existing normalized profile structure
    const { data: profileRow, error: fetchError } = await supabase
      .from('profiles')
      .select(`
        *,
        academic_scores!left(*),
        study_targets!left(*),
        co_applicants!left(*),
        documents!left(*),
        shortlisted_universities!left(*)
      `)
      .eq('email', email)
      .single();

    if (fetchError || !profileRow) {
      console.warn('Profile not found for updates:', fetchError);
      return NextResponse.json({ status: 'error', message: 'Profile not found.' }, { status: 404 });
    }

    // Assemble a flat representation of the current state
    const currentScores  = profileRow.academic_scores || {};
    const currentTargets = profileRow.study_targets || {};
    const currentParent  = profileRow.co_applicants || {};
    const currentDocs    = Array.isArray(profileRow.documents) ? profileRow.documents.map((d: any) => d.name) : [];
    const currentUnis    = Array.isArray(profileRow.shortlisted_universities) ? profileRow.shortlisted_universities.map((u: any) => u.university_name) : [];

    const currentFlatProfile: UserProfile = {
      name:                    profileRow.name,
      email:                   profileRow.email,
      phone:                   profileRow.phone || '',
      stage:                   currentTargets.stage || 'explorer',
      targetCountry:           currentTargets.target_country || '',
      targetField:             currentTargets.target_field || '',
      degree:                  currentTargets.degree || 'masters',
      budget:                  currentTargets.budget || 0,
      gpa:                     currentScores.gpa || 0,
      greScore:                currentScores.gre_score || 0,
      toeflScore:              currentScores.toefl_score || 0,
      ieltsScore:              currentScores.ielts_score || 0,
      workExperience:          currentScores.work_experience || 0,
      hasResearch:             currentScores.has_research || false,
      parentName:              currentParent.name || '',
      parentPhone:             currentParent.phone || '',
      parentIncome:            currentParent.income || 0,
      parentOccupation:        currentParent.occupation || '',
      docsUploaded:            currentDocs,
      shortlistedUniversities: currentUnis,
      kycVerified:             profileRow.kyc_verified || false,
    };

    // 3. Merge updates
    const mergedProfile = { ...currentFlatProfile, ...updates };

    // 4. Calculate secure server-side LRS
    // Accumulate the intent score correctly
    const intentPoints = Number(updates.intentScore) || 0;
    const finalIntentScore = Math.min(100, (currentScores.intent_score || 0) + intentPoints);
    
    const trueLrs = calculateLRS(mergedProfile, finalIntentScore);
    const finalLrsScore = trueLrs.score;

    // 5. Update: profiles (core metadata)
    const profileUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) profileUpdates.name = updates.name;
    if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
    if (updates.kycVerified !== undefined) profileUpdates.kyc_verified = updates.kycVerified;
    if (updates.role !== undefined) profileUpdates.role = updates.role;
    if (updates.roleStatus !== undefined) profileUpdates.role_status = updates.roleStatus;
    if (profileUpdates.role === 'admin' && process.env.NODE_ENV === 'development') {
      profileUpdates.role_status = 'approved';
    }

    if (Object.keys(profileUpdates).length > 1) {
      await supabase.from('profiles').update(profileUpdates).eq('id', profileRow.id);
    }

    // 6. Update: academic_scores
    const scoresUpdates: Record<string, any> = {
      profile_id:   profileRow.id,
      lrs_score:    finalLrsScore,
      intent_score: finalIntentScore,
      updated_at:   new Date().toISOString()
    };
    if (updates.gpa !== undefined)            scoresUpdates.gpa = updates.gpa;
    if (updates.greScore !== undefined)       scoresUpdates.gre_score = updates.greScore;
    if (updates.toeflScore !== undefined)     scoresUpdates.toefl_score = updates.toeflScore;
    if (updates.ieltsScore !== undefined)     scoresUpdates.ielts_score = updates.ieltsScore;
    if (updates.workExperience !== undefined) scoresUpdates.work_experience = updates.workExperience;
    if (updates.hasResearch !== undefined)    scoresUpdates.has_research = updates.hasResearch;

    await supabase.from('academic_scores').upsert(scoresUpdates, { onConflict: 'profile_id' });

    // 7. Update: study_targets
    const targetsUpdates: Record<string, any> = {
      profile_id: profileRow.id,
      updated_at: new Date().toISOString()
    };
    if (updates.stage !== undefined)         targetsUpdates.stage = updates.stage;
    if (updates.targetCountry !== undefined) targetsUpdates.target_country = updates.targetCountry;
    if (updates.targetField !== undefined)   targetsUpdates.target_field = updates.targetField;
    if (updates.degree !== undefined)        targetsUpdates.degree = updates.degree;
    if (updates.budget !== undefined)        targetsUpdates.budget = updates.budget;

    await supabase.from('study_targets').upsert(targetsUpdates, { onConflict: 'profile_id' });

    // 8. Update: co_applicants
    const parentUpdates: Record<string, any> = {
      profile_id: profileRow.id,
      updated_at: new Date().toISOString()
    };
    let hasParentUpdate = false;
    if (updates.parentName !== undefined) { parentUpdates.name = updates.parentName; hasParentUpdate = true; }
    if (updates.parentPhone !== undefined) { parentUpdates.phone = updates.parentPhone; hasParentUpdate = true; }
    if (updates.parentIncome !== undefined) { parentUpdates.income = updates.parentIncome; hasParentUpdate = true; }
    if (updates.parentOccupation !== undefined) { parentUpdates.occupation = updates.parentOccupation; hasParentUpdate = true; }

    if (hasParentUpdate) {
      await supabase.from('co_applicants').upsert(parentUpdates, { onConflict: 'profile_id' });
    }

    // 9. Update: shortlisted_universities (sync mapping)
    if (updates.shortlistedUniversities !== undefined && Array.isArray(updates.shortlistedUniversities)) {
      const newUnis: string[] = updates.shortlistedUniversities;
      // Delete missing shortlists
      await supabase.from('shortlisted_universities')
        .delete()
        .eq('profile_id', profileRow.id)
        .not('university_name', 'in', `(${newUnis.map(u => `"${u}"`).join(',') || '""'})`);
      
      // Insert new ones
      for (const uniName of newUnis) {
        if (!currentUnis.includes(uniName)) {
          await supabase.from('shortlisted_universities').upsert({
            profile_id: profileRow.id,
            university_name: uniName
          }, { onConflict: 'profile_id,university_name' });
        }
      }
    }

    // 10. Update: documents (sync mapping)
    if (updates.docsUploaded !== undefined && Array.isArray(updates.docsUploaded)) {
      const newDocs: string[] = updates.docsUploaded;
      // Delete missing documents
      await supabase.from('documents')
        .delete()
        .eq('profile_id', profileRow.id)
        .not('name', 'in', `(${newDocs.map(d => `"${d}"`).join(',') || '""'})`);

      // Insert new ones
      for (const docName of newDocs) {
        if (!currentDocs.includes(docName)) {
          await supabase.from('documents').insert({
            profile_id: profileRow.id,
            name: docName
          });
        }
      }
    }

    // Compile and return the newly saved profile state
    const resultProfile = {
      ...mergedProfile,
      lrsScore: finalLrsScore,
      intentScore: finalIntentScore,
    };

    return NextResponse.json({ status: 'success', profile: resultProfile });

  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to update profile' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data: profileRow, error } = await supabase
      .from('profiles')
      .select(`
        *,
        academic_scores!left(*),
        study_targets!left(*),
        co_applicants!left(*),
        documents!left(*),
        shortlisted_universities!left(*)
      `)
      .eq('email', email)
      .single();

    if (error || !profileRow) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
      console.error('Profile Fetch Error (Supabase):', error);
      return NextResponse.json({ status: 'error', message: 'Failed to fetch profile' }, { status: 500 });
    }

    // Map nested relational data back to flat UserProfile expected by client
    const scores  = profileRow.academic_scores || {};
    const targets = profileRow.study_targets || {};
    const parent  = profileRow.co_applicants || {};
    const docs    = Array.isArray(profileRow.documents) ? profileRow.documents.map((d: any) => d.name) : [];
    const unis    = Array.isArray(profileRow.shortlisted_universities) ? profileRow.shortlisted_universities.map((u: any) => u.university_name) : [];

    const { data: loanRow } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('profile_id', profileRow.id)
      .maybeSingle();

    const camelProfile = {
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
      loanApplication: loanRow ? {
        submitted: true,
        lenderId: loanRow.lender_id,
        lenderName: loanRow.lender_name,
        universityName: loanRow.university_name,
        principalINR: Number(loanRow.principal_inr),
        submittedAt: loanRow.submitted_at,
        referenceId: loanRow.reference_id,
        status: loanRow.status,
      } : null,
    };

    return NextResponse.json({ status: 'success', profile: camelProfile });

  } catch (error) {
    console.error('Profile Fetch Error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch profile' }, { status: 500 });
  }
}
