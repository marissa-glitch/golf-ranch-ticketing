import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Browser client — lazy singleton, safe to use in Client Components
let _browserClient: SupabaseClient | null = null
export function getBrowserClient(): SupabaseClient {
  if (!_browserClient) {
    _browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _browserClient
}

// Convenience export — same lazy singleton
export const supabase = {
  from: (...args: Parameters<SupabaseClient['from']>) => getBrowserClient().from(...args),
}

// Server client — uses service role key, bypasses RLS
// Only use in Server Components, Route Handlers, Server Actions
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
