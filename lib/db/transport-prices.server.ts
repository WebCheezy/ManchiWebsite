import "server-only"
import { getServerClient } from "./server"
import { getSupabaseAdmin, hasServiceRoleKey } from "./supabase-admin"
import type { TransportPrice } from "./types"
import { BASE_TRANSPORT_FEE_NAIRA } from "@/lib/delivery/served-regions"

async function getDb() {
  if (hasServiceRoleKey()) {
    return getSupabaseAdmin()
  }
  return await getServerClient()
}

/** Matches `public.transport_prices` (PK: lga). */
export async function getTransportPriceByLga(lga: string): Promise<TransportPrice | null> {
  const key = lga.trim()
  if (!key) return null

  const supabase = await getDb()
  const { data, error } = await supabase.from("transport_prices").select("*").eq("lga", key).maybeSingle()

  if (error) {
    console.error("[getTransportPriceByLga]", error.message)
    return null
  }
  return data as TransportPrice | null
}

/**
 * Naira fee for an address LGA. Uses DB row when present; otherwise `baseTransportFeeNaira` from
 * `manchi-served-regions.json`.
 */
export async function resolveTransportFeeNaira(lga: string, _state: string): Promise<number> {
  const row = await getTransportPriceByLga(lga)
  if (row != null && Number.isFinite(row.price)) {
    return row.price
  }
  return BASE_TRANSPORT_FEE_NAIRA
}
