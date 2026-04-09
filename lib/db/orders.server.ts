import "server-only"
import { nairaToKobo } from "@/lib/paystack.server"
import { getServerClient } from "./server"
import { getSupabaseAdmin, hasServiceRoleKey } from "./supabase-admin"
import type { DeliveryMethod, Order, StoreLocation } from "./types"

/** Prefer service role (same as mobile API) so RLS does not block inserts/updates. */
async function getDbForOrders() {
  if (hasServiceRoleKey()) {
    return getSupabaseAdmin()
  }
  return await getServerClient()
}

export type BackendCartItem = {
  name: string
  food_id: number | null
  options: unknown[]
  side_id: number | null
  quantity: number
  image_url: string | null
  item_type: string
  price_at_time: number
}

// Backend-expected shape for order items (array of normalized item objects).
export type OrderItemsPayload = BackendCartItem[]

/** List orders for the current user (newest first) */
export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const supabase = await getDbForOrders()
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getOrdersForUser]", error.message)
    return []
  }
  return (data ?? []) as Order[]
}

export interface CreateOrderInput {
  user_id: string
  total_amount: number
  vat: number
  delivery_method: DeliveryMethod
  delivery_address: string | null
  location: StoreLocation | string
  items: OrderItemsPayload
  status: string
}

export async function createOrder(input: CreateOrderInput): Promise<{ id: number } | null> {
  const supabase = await getDbForOrders()
  const row: Record<string, unknown> = {
    user_id: input.user_id,
    status: input.status,
    total_amount: input.total_amount,
    vat: input.vat,
    delivery_method: input.delivery_method,
    delivery_address: input.delivery_address,
    delivery_lat: null,
    delivery_lng: null,
    location: input.location,
    items: input.items as unknown as Record<string, unknown>,
  }

  const { data, error } = await supabase.from("orders").insert(row)
    .select("id")
    .single()

  if (error) {
    console.error("[createOrder]", error.message)
    return null
  }
  return data as { id: number }
}

/** Mark order paid using id from Paystack verify metadata (same pattern as mobile: no orders.paystack_reference column). */
export async function markOrderPaidByVerifiedMetadata(input: {
  orderId: number
  metadataUserId?: string
  amountKobo?: number
}): Promise<boolean> {
  const supabase = await getDbForOrders()
  const { data: order, error: findErr } = await supabase
    .from("orders")
    .select("id, user_id, total_amount, status")
    .eq("id", input.orderId)
    .maybeSingle()

  if (findErr || !order) {
    console.error("[markOrderPaidByVerifiedMetadata] order not found", input.orderId)
    return false
  }

  if (input.metadataUserId && order.user_id !== input.metadataUserId) {
    console.error("[markOrderPaidByVerifiedMetadata] user_id mismatch for order", input.orderId)
    return false
  }

  if (input.amountKobo != null) {
    const expected = nairaToKobo(Number(order.total_amount))
    if (Math.abs(input.amountKobo - expected) > 1) {
      console.error("[markOrderPaidByVerifiedMetadata] amount mismatch", {
        orderId: input.orderId,
        expectedKobo: expected,
        gotKobo: input.amountKobo,
      })
      return false
    }
  }

  const { error } = await supabase.from("orders").update({ status: "paid" }).eq("id", order.id)

  if (error) {
    console.error("[markOrderPaidByVerifiedMetadata]", error.message)
    return false
  }
  return true
}

/** After Paystack redirects back with ?reference= — verify payment and mark order paid via metadata.order_id */
export async function verifyAndCompleteOrder(reference: string): Promise<{ ok: boolean; error?: string }> {
  const { verifyPaystackTransaction } = await import("@/lib/paystack.server")
  const verify = await verifyPaystackTransaction(reference)
  if (!verify.ok) {
    return { ok: false, error: verify.error || "Payment could not be verified" }
  }
  if (verify.orderId == null) {
    return {
      ok: false,
      error:
        "Payment verified but order id was not found in transaction metadata. Ensure checkout sends metadata.order_id with Paystack initialize.",
    }
  }
  const updated = await markOrderPaidByVerifiedMetadata({
    orderId: verify.orderId,
    metadataUserId: verify.userId,
    amountKobo: verify.amountKobo,
  })
  return updated ? { ok: true } : { ok: false, error: "Could not update order status" }
}
