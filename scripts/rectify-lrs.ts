import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined.');
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function rectifyScores() {
  console.log('Fetching all profiles to check for out-of-bounds LRS scores...');
  const { data: profiles, error } = await supabase.from('profiles').select('id, name, lrs_score');
  
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  let count = 0;
  for (const profile of profiles) {
    if (profile.lrs_score > 850 || profile.lrs_score < 300) {
      const clampedScore = Math.min(850, Math.max(300, profile.lrs_score));
      console.log(`Rectifying ${profile.name}: ${profile.lrs_score} -> ${clampedScore}`);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ lrs_score: clampedScore })
        .eq('id', profile.id);

      if (updateError) {
        console.error(`Failed to update ${profile.name}:`, updateError);
      } else {
        count++;
      }
    }
  }

  console.log(`Rectification complete. Fixed ${count} profiles.`);
}

rectifyScores();
