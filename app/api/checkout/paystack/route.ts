import { NextResponse } from "next/server"
import { resolveApiUserId } from "@/lib/api-auth"
import { getAddressByIdForUser } from "@/lib/db/addresses.server"
import { createOrder, type BackendCartItem } from "@/lib/db/orders.server"
import { resolveTransportFeeNaira } from "@/lib/db/transport-prices.server"
import type { CartItem, DeliveryMethod, StoreLocation } from "@/lib/db/types"
import { isServedRegion, servedRegionErrorMessage } from "@/lib/delivery/served-regions"
import { nairaToKobo } from "@/lib/paystack.server"
import { assertCartAvailableAtLocation } from "@/lib/db/availability.server"

const CHECKOUT_VAT_RATE = 0.075

function mapCartItemToBackendCartItem(cartItem: CartItem): BackendCartItem {
  const sides = Array.isArray(cartItem.sides) ? cartItem.sides : []
  const requiredSide = sides[0] ?? null
  const optionalSides = sides.length > 1 ? sides.slice(1) : []

  return {
    item_type: "food",
    name: cartItem.foodName,
    food_id: cartItem.foodId ?? null,
    side_id: requiredSide ? requiredSide.id : null,
    options: optionalSides.map((s) => ({
      side_id: s.id,
      quantity: s.quantity,
    })),
    quantity: cartItem.quantity,
    image_url: cartItem.foodImage,
    price_at_time: cartItem.foodPrice,
  }
}

export async function POST(req: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ error: "Payment is not configured." }, { status: 500 })
  }

  const body = (await req.json().catch(() => null)) as null | {
    cart_items?: CartItem[]
    subtotal?: number
    vat?: number
    total?: number
    delivery_method?: DeliveryMethod
    location?: StoreLocation
    delivery_address?: string | null
    /** Saved address id (web); server resolves LGA for `transport_prices`. */
    delivery_address_id?: string | null
    /** Mobile / API clients without saved row: must match a served LGA. */
    delivery_lga?: string | null
    delivery_state?: string | null
    delivery_notes?: string | null
    callback_url?: string
    /** Mobile / API key clients: same as your backend docs */
    user_id?: string
    userId?: string
    email?: string
  }

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const { userId, email: emailFromSession, error: authError } = await resolveApiUserId(
    req,
    body?.user_id ?? body?.userId
  )
  if (!userId || authError) {
    return NextResponse.json({ error: authError ?? "Unauthorized" }, { status: 401 })
  }

  const paystackEmail = (emailFromSession ?? body?.email)?.trim()
  if (!paystackEmail) {
    return NextResponse.json(
      { error: "Email is required for checkout (sign in on web, or send email in the request body for API clients)." },
      { status: 400 }
    )
  }

  if (!body?.cart_items || !Array.isArray(body.cart_items) || body.cart_items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 })
  }

  const subtotal = body.subtotal
  if (typeof subtotal !== "number" || subtotal <= 0) {
    return NextResponse.json({ error: "Invalid subtotal." }, { status: 400 })
  }

  const delivery_method = body.delivery_method
  if (delivery_method !== "delivery" && delivery_method !== "pickup") {
    return NextResponse.json({ error: "Invalid delivery method." }, { status: 400 })
  }

  const location = body.location
  if (location !== "Chasemall" && location !== "Aurora" && location !== "Eromo") {
    return NextResponse.json({ error: "Invalid location." }, { status: 400 })
  }

  const availabilityError = await assertCartAvailableAtLocation(body.cart_items, location)
  if (availabilityError) {
    return NextResponse.json({ error: availabilityError }, { status: 400 })
  }

  if (delivery_method === "delivery" && !body.delivery_address?.trim()) {
    return NextResponse.json({ error: "Delivery address is required for delivery." }, { status: 400 })
  }

  let transportNaira = 0
  if (delivery_method === "delivery") {
    let lga: string | null = null
    let state: string | null = null

    const addrId = body.delivery_address_id?.trim()
    if (addrId) {
      const addr = await getAddressByIdForUser(addrId, userId)
      if (!addr) {
        return NextResponse.json({ error: "Invalid delivery address." }, { status: 400 })
      }
      lga = addr.lga
      state = addr.state
    } else if (body.delivery_lga?.trim() && body.delivery_state?.trim()) {
      lga = body.delivery_lga.trim()
      state = body.delivery_state.trim()
    } else {
      return NextResponse.json(
        {
          error:
            "Delivery checkout requires delivery_address_id (saved address) or delivery_lga and delivery_state (API clients).",
        },
        { status: 400 }
      )
    }

    if (!isServedRegion(state, lga)) {
      return NextResponse.json({ error: servedRegionErrorMessage() }, { status: 400 })
    }

    transportNaira = await resolveTransportFeeNaira(lga, state)
  }

  const expectedVat = Math.round(subtotal * CHECKOUT_VAT_RATE)
  const expectedTotal = subtotal + expectedVat + transportNaira

  const clientTotal = body.total
  const clientVat = body.vat
  if (typeof clientTotal !== "number" || clientTotal <= 0 || typeof clientVat !== "number" || clientVat < 0) {
    return NextResponse.json({ error: "Invalid order totals." }, { status: 400 })
  }

  if (Math.abs(expectedTotal - clientTotal) > 2 || Math.abs(expectedVat - clientVat) > 2) {
    return NextResponse.json(
      { error: "Order total does not match server pricing (transport from database). Refresh checkout and try again." },
      { status: 400 }
    )
  }

  const amountKobo = nairaToKobo(expectedTotal)

  const backendCartItems: BackendCartItem[] = body.cart_items.map(mapCartItemToBackendCartItem)

  // 1) Create order first (same schema as mobile — no paystack_reference column required).
  const created = await createOrder({
    user_id: userId,
    total_amount: expectedTotal,
    vat: expectedVat,
    delivery_method,
    delivery_address: body.delivery_address?.trim() ?? null,
    location,
    // Persist backend-expected items array shape.
    // (Checkout still accepts `delivery_notes`, but the current orders payload expects normalized order items.)
    items: backendCartItems,
    status: "awaiting_payment",
  })

  if (!created) {
    return NextResponse.json(
      { error: "Could not save your order. Check Supabase logs and that the service role key is set if RLS blocks inserts." },
      { status: 500 }
    )
  }

  // 2) Paystack initialize with metadata.order_id — verify API echoes this so we mark paid without storing reference on orders.
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: paystackEmail,
      amount: amountKobo,
      callback_url: body.callback_url,
      metadata: {
        user_id: userId,
        order_id: String(created.id),
      },
    }),
  })

  const json = (await res.json().catch(() => null)) as {
    status?: boolean
    message?: string
    data?: { authorization_url?: string; reference?: string; access_code?: string }
  }

  if (!res.ok || !json?.status || !json.data?.authorization_url || !json.data?.reference) {
    return NextResponse.json(
      { error: json?.message || "Order was created but payment could not be started. You can retry from My Orders or contact support." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    authorization_url: json.data.authorization_url,
    reference: json.data.reference,
  })
}
