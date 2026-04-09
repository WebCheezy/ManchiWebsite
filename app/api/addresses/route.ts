import { NextResponse } from "next/server"
import { resolveApiUserId } from "@/lib/api-auth"
import { createAddressForUser } from "@/lib/db/addresses.server"
import { isServedRegion, servedRegionErrorMessage } from "@/lib/delivery/served-regions"

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | {
        user_id?: string
        userId?: string
        title?: string | null
        state?: string
        lga?: string
        area?: string
        street?: string
        house_number?: string
        is_default?: boolean
      }
    | null

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const { userId, error: authError } = await resolveApiUserId(req, body.user_id ?? body.userId)
  if (!userId || authError) {
    return NextResponse.json({ error: authError ?? "Unauthorized" }, { status: 401 })
  }

  if (!body.state || !body.lga || !body.area || !body.street || !body.house_number) {
    return NextResponse.json({ error: "Missing required address fields." }, { status: 400 })
  }

  if (!isServedRegion(body.state, body.lga)) {
    return NextResponse.json({ error: servedRegionErrorMessage() }, { status: 400 })
  }

  const created = await createAddressForUser({
    userId,
    title: body.title ?? null,
    state: body.state,
    lga: body.lga,
    area: body.area,
    street: body.street,
    house_number: body.house_number,
    is_default: body.is_default ?? false,
  })

  if (!created) {
    return NextResponse.json({ error: "Could not save address." }, { status: 500 })
  }

  return NextResponse.json(created)
}
