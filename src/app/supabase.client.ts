import {createClient} from '@supabase/supabase-js'

const supabaseUrl='https://bzvihhuygskkvmepspeg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dmloaHV5Z3Nra3ZtZXBzcGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTkzNzAsImV4cCI6MjA2NDAzNTM3MH0.Q91KEU5XEFouUv92bGTGmOyeHnHPQQwgiBOL5MrincA';

export const supabase = createClient(supabaseUrl, supabaseKey);