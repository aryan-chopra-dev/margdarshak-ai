import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Need to dynamically import calculateLRS because it's a TS file
// But since this is a script run by tsx, we can import it directly.
import { calculateLRS, UserProfile } from '../src/lib/store.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

const parseJsonbArray = (val: any) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
};

async function rectifyScores() {
  console.log('Fetching all profiles to strictly recalculate LRS scores...');
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  let count = 0;
  for (const snakeProfile of profiles) {
    // 1. Map to camelCase
    const camelProfile = mapKeys(snakeProfile, toCamelCase) as UserProfile;
    
    // 2. Normalize arrays
    camelProfile.shortlistedUniversities = parseJsonbArray(camelProfile.shortlistedUniversities);
    camelProfile.docsUploaded = parseJsonbArray(camelProfile.docsUploaded);

    // 3. Calculate true score
    const intent = Number(snakeProfile.intent_score) || 0;
    const trueLrs = calculateLRS(camelProfile, intent);

    if (snakeProfile.lrs_score !== trueLrs.score) {
      console.log(`Rectifying ${snakeProfile.name || snakeProfile.email}: ${snakeProfile.lrs_score} -> ${trueLrs.score}`);
      
      // 4. Force update database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ lrs_score: trueLrs.score })
        .eq('id', snakeProfile.id);

      if (updateError) {
        console.error(`Failed to update ${snakeProfile.email}:`, updateError);
      } else {
        count++;
      }
    } else {
      console.log(`Verified ${snakeProfile.name || snakeProfile.email}: Score is already perfectly matched at ${trueLrs.score}.`);
    }
  }

  console.log(`Database sweep complete. Rectified ${count} profiles.`);
}

rectifyScores();
