import { NextResponse } from "next/server"
import { resolveTransportFeeNaira } from "@/lib/db/transport-prices.server"

/** Public lookup: transport fee in Naira for a state + LGA (LGA matches `transport_prices.lga`). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lga = searchParams.get("lga")?.trim()
  const state = searchParams.get("state")?.trim()
  if (!lga || !state) {
    return NextResponse.json({ error: "Query params lga and state are required." }, { status: 400 })
  }

  const price = await resolveTransportFeeNaira(lga, state)
  return NextResponse.json({ price })
}
