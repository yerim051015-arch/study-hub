import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wluaxkgqqfvusyfkcbid.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdWF4a2dxcWZ2dXN5ZmtjYmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NDYzMjIsImV4cCI6MjEwMTEyMjMyMn0.pEemUWyz-tq489cHAg6NxrMB-XPxYEEL4zcn4blri1o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
