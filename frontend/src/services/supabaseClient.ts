import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tzwpkpeswntfwnpknqoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6d3BrcGVzd250ZnducGtucW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MDA5NDQsImV4cCI6MjA4OTM3Njk0NH0.FWcUoZGxvksU4yQdKpzM5VGS_dCj8BrgBNp1Ck2x90Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
