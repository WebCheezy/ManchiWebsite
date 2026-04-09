import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Server Supabase client for use in Server Components and Route Handlers.
 * Load .env.local from the app root (v0-manchi-restaurant-website) when running next dev/build.
 */
export async function getServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored in Server Components; middleware can handle token refresh
          }
        },
      },
    }
  )
}
