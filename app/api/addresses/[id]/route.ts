import { NextResponse } from "next/server"
import { resolveApiUserId } from "@/lib/api-auth"
import { deleteAddressForUser, getAddressByIdForUser, updateAddressForUser } from "@/lib/db/addresses.server"
import { isServedRegion, servedRegionErrorMessage } from "@/lib/delivery/served-regions"

type Payload = {
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = (await req.json().catch(() => null)) as Payload | null
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }
  const { id } = await params
  const { userId, error: authError } = await resolveApiUserId(req, body.user_id ?? body.userId)
  if (!userId || authError) {
    return NextResponse.json({ error: authError ?? "Unauthorized" }, { status: 401 })
  }

  const existing = await getAddressByIdForUser(id, userId)
  if (!existing) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 })
  }

  const nextState = body.state ?? existing.state
  const nextLga = body.lga ?? existing.lga
  if (body.state !== undefined || body.lga !== undefined) {
    if (!isServedRegion(nextState, nextLga)) {
      return NextResponse.json({ error: servedRegionErrorMessage() }, { status: 400 })
    }
  }

  const updated = await updateAddressForUser({
    id,
    userId,
    title: body.title,
    state: body.state,
    lga: body.lga,
    area: body.area,
    street: body.street,
    house_number: body.house_number,
    is_default: body.is_default,
  })

  if (!updated) {
    return NextResponse.json({ error: "Could not update address." }, { status: 500 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = (await req.json().catch(() => ({}))) as Payload
  const { id } = await params
  const { userId, error: authError } = await resolveApiUserId(req, body.user_id ?? body.userId)
  if (!userId || authError) {
    return NextResponse.json({ error: authError ?? "Unauthorized" }, { status: 401 })
  }

  const ok = await deleteAddressForUser({ id, userId })
  if (!ok) {
    return NextResponse.json({ error: "Could not delete address." }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
