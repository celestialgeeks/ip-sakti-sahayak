import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yfjlefmqlqqdvjutkqxr.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmamxlZm1xbHFxZHZqdXRrcXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMjUyODEsImV4cCI6MjEwNDkwMTI4MX0.dSl09LGPXJGFDGm5pQpfLG9WnTKU4cDYrcNMbr93dzg';

export function createClient() {
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
}
