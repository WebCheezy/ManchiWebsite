import "server-only"
import { getUser } from "@/lib/auth.server"

/**
 * Same security model as the mobile backend docs:
 * - **Website**: Supabase session cookie → `getUser()` succeeds.
 * - **Mobile / external**: `x-api-key` must match `API_SECRET_KEY`, and `userId` in the JSON body.
 *
 * For Paystack, **email** comes from the session when present; otherwise mobile must send `email` in the body.
 */
export async function resolveApiUserId(
  req: Request,
  userIdFromBody?: string | null
): Promise<{ userId: string | null; email: string | null; error: string | null }> {
  const sessionUser = await getUser()
  if (sessionUser?.id) {
    return {
      userId: sessionUser.id,
      email: sessionUser.email ?? null,
      error: null,
    }
  }

  const expected = process.env.API_SECRET_KEY
  if (!expected) {
    return { userId: null, email: null, error: "Not signed in." }
  }

  const apiKey = req.headers.get("x-api-key")
  if (apiKey !== expected) {
    return { userId: null, email: null, error: "Invalid or missing API key." }
  }

  const uid = userIdFromBody?.trim()
  if (!uid) {
    return { userId: null, email: null, error: "userId is required when using API key." }
  }

  return { userId: uid, email: null, error: null }
}
