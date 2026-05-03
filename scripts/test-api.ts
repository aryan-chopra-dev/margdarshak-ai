import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: firstProfile } = await supabase.from('profiles').select('email, name, lrs_score').limit(1).single();
  if (!firstProfile) return console.log('No profiles found');

  const email = firstProfile.email;
  console.log('Testing with email:', email);

  const res = await fetch('http://localhost:3000/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, lrsScore: 888 })
  });

  const resData = await res.json();
  console.log('API Response:', resData);

  const { data: after } = await supabase.from('profiles').select('email, lrs_score').eq('email', email).single();
  console.log('After API:', after);
}

check();
