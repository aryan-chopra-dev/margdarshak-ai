import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateLRS, UserProfile } from '@/lib/store';

// Helper functions for mapping object keys
function toSnakeCase(str: string) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function toCamelCase(str: string) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function mapKeys(obj: any, mapper: (key: string) => string) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  return Object.keys(obj).reduce((acc: any, key) => {
    acc[mapper(key)] = obj[key];
    return acc;
  }, {});
}

// ============================================================================
// Profile API — Unified on Supabase Postgres
// ============================================================================

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, ...updates } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Convert camelCase keys from the client to snake_case for Supabase
    const snakeUpdates = mapKeys(updates, toSnakeCase);

    // SECURE LRS CALCULATION (Server-Side)
    // 1. Fetch existing profile to compute LRS accurately against all fields
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
       console.warn('Failed to fetch existing profile for LRS calculation, falling back to updates only', fetchError);
    }

    // 2. Merge existing DB data with new incoming updates
    const mergedSnakeProfile = { ...(existingProfile || {}), ...snakeUpdates, email };

    // 3. Normalize JSONB arrays for the calculation engine
    const parseJsonbArray = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return []; }
      }
      return [];
    };

    // 4. Map to UserProfile format expected by calculateLRS
    const camelMergedProfile = mapKeys(mergedSnakeProfile, toCamelCase) as UserProfile;
    camelMergedProfile.shortlistedUniversities = parseJsonbArray(camelMergedProfile.shortlistedUniversities);
    camelMergedProfile.docsUploaded = parseJsonbArray(camelMergedProfile.docsUploaded);

    // 5. Calculate the TRUE score dynamically based on the verified backend state
    const intent = Number(mergedSnakeProfile.intent_score) || 0;
    const trueLrs = calculateLRS(camelMergedProfile, intent);

    // 6. Hard override the lrs_score from the client to prevent manipulation vulnerabilities
    snakeUpdates.lrs_score = trueLrs.score;

    const updatePayload: Record<string, unknown> = {
      ...snakeUpdates,
      updated_at: new Date().toISOString(),
    };

    // Parse legacy string arrays if necessary
    if (typeof updatePayload.shortlisted_universities === 'string') {
      try { updatePayload.shortlisted_universities = JSON.parse(updatePayload.shortlisted_universities as string); }
      catch { updatePayload.shortlisted_universities = []; }
    }
    if (typeof updatePayload.docs_uploaded === 'string') {
      try { updatePayload.docs_uploaded = JSON.parse(updatePayload.docs_uploaded as string); }
      catch { updatePayload.docs_uploaded = []; }
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

    // Map the returned row back to camelCase for the client
    const camelProfile = mapKeys(profile, toCamelCase);
    return NextResponse.json({ status: 'success', profile: camelProfile });

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
      if (error?.code === 'PGRST116') {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
      console.error('Profile Fetch Error (Supabase):', error);
      return NextResponse.json({ status: 'error', message: 'Failed to fetch profile' }, { status: 500 });
    }

    // Map Supabase snake_case row back to camelCase for the client
    const camelProfile = mapKeys(profile, toCamelCase);

    // Defensively ensure arrays
    const parsedProfile = {
      ...camelProfile,
      shortlistedUniversities: Array.isArray(camelProfile.shortlistedUniversities)
        ? camelProfile.shortlistedUniversities
        : (() => { try { return JSON.parse(camelProfile.shortlistedUniversities || '[]'); } catch { return []; } })(),
      docsUploaded: Array.isArray(camelProfile.docsUploaded)
        ? camelProfile.docsUploaded
        : (() => { try { return JSON.parse(camelProfile.docsUploaded || '[]'); } catch { return []; } })(),
    };

    return NextResponse.json({ status: 'success', profile: parsedProfile });

  } catch (error) {
    console.error('Profile Fetch Error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch profile' }, { status: 500 });
  }
}

