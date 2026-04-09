import "server-only"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Singleton admin client (service role). Bypasses RLS — use only on the server
 * after you have verified the user (session or API key + userId), same as the mobile backend.
 */
let admin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are required for server-side order operations (match mobile API)."
    )
  }
  if (!admin) {
    admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return admin
}

export function hasServiceRoleKey(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY
}
