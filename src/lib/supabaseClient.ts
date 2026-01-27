import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// validation
const isConfigured = supabaseUrl && supabaseUrl.startsWith('http') && !supabaseUrl.includes('your_supabase');

if (!isConfigured && typeof window !== 'undefined') {
    console.log("%c[Supabase] Configuration missing or invalid in .env.local", "color: orange; font-weight: bold;");
}

const safeUrl = isConfigured ? supabaseUrl! : 'https://placeholder.supabase.co';
const safeKey = (supabaseAnonKey && !supabaseAnonKey.includes('your_supabase')) ? supabaseAnonKey : 'placeholder';

export const supabase = createClient(safeUrl, safeKey);
