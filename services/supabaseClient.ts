import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pjfxsolguakkfhocqkxj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZnhzb2xndWFra2Zob2Nxa3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NTIzMjcsImV4cCI6MjA3MzQyODMyN30.3MOlDeqdZg7E0-t7t6ESQnb1uVPa9wlCXAmIjgUxe8Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
