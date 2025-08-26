import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aqtwasxdpkrkavqworwm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxdHdhc3hkcGtya2F2cXdvcndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjk4NzUsImV4cCI6MjA3MTc0NTg3NX0.aIL3uIycOHqhlh_2xXncOFSHmDK-_yor7eWv8SxOu_w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
