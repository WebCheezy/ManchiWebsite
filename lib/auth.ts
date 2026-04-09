import { createClient } from "@/lib/db/client"

// ─── Client-side (for Client Components) ───────────────────────────────────

/** Sign in with email and password */
export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { user: null, error: error.message }
  }
  return { user: data.user, error: null }
}

/** Sign up with email and password only (no extra profile fields at registration). */
export async function signUp(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  })
  if (error) {
    return { user: null, session: null, error: error.message }
  }
  return { user: data.user, session: data.session, error: null }
}

/**
 * Send a one-time code (OTP) to an existing user's email for login.
 * If the email is not registered, this returns a signup-directed message.
 */
export async function sendEmailCode(email: string, next = "/") {
  const supabase = createClient()
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo,
      shouldCreateUser: false,
    },
  })
  if (error) {
    const raw = error.message.toLowerCase()
    if (
      raw.includes("user not found") ||
      raw.includes("signup") ||
      raw.includes("sign up") ||
      raw.includes("not allowed")
    ) {
      return {
        success: false,
        error: "Email not registered. Please sign up first, then log in.",
      }
    }
    return { success: false, error: error.message }
  }
  return { success: true, error: null }
}

/**
 * Verify the 6-digit code sent to the user's email. Use after sendEmailCode().
 */
export async function verifyEmailCode(email: string, token: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: "email",
  })
  if (error) {
    return { user: null, error: error.message }
  }
  return { user: data.user, error: null }
}

/** Sign out */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    return { error: error.message }
  }
  return { error: null }
}

/** Get current session on client */
export async function getSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    return { session: null, error: error.message }
  }
  return { session, error: null }
}
