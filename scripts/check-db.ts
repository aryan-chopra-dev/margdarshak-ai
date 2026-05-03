import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Successfully fetched from profiles.');
    if (data && data.length > 0) {
      console.log('Columns found:', Object.keys(data[0]).join(', '));
    } else {
      console.log('Profiles table is empty. Attempting to insert a dummy row to test columns...');
      const { data: insertData, error: insertError } = await supabase.from('profiles').insert([{ email: 'test_db_check@example.com', name: 'Test' }]).select();
      if (insertError) {
         console.error('Insert error:', insertError);
      } else {
         console.log('Insert success, columns:', Object.keys(insertData[0]).join(', '));
      }
    }
  }
}

check();
