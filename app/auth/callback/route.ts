import { NextResponse } from "next/server"
import { getServerClient } from "@/lib/db/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")
  const next = requestUrl.searchParams.get("next") || "/"

  if (code) {
    const supabase = await getServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If this is a password recovery, redirect to reset password page
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/reset-password", requestUrl.origin))
      }

      // Otherwise redirect to the next URL or home
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(
    new URL("/login?error=Could not authenticate", requestUrl.origin)
  )
}
