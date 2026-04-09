import "server-only"
import { getServerClient } from "@/lib/db/server"
import type { User } from "@supabase/supabase-js"

// ─── Server-side (for Server Components) ───────────────────────────────────

/** Get the current user on the server */
export async function getUser(): Promise<User | null> {
  const supabase = await getServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    // "Auth session missing!" is expected when user is not logged in — don't log
    if (error.message !== "Auth session missing!") {
      console.error("[getUser]", error.message)
    }
    return null
  }
  return user
}
