import "server-only"
import { getServerClient } from "./server"
import type { Profile } from "./types"

/** Get a user's profile (server-side) */
export async function getProfileServer(userId: string): Promise<Profile | null> {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("[getProfileServer]", error.message)
    return null
  }
  return data as Profile
}
