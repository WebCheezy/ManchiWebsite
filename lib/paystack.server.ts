import "server-only"

/** Paystack expects amount in kobo (smallest NGN unit). Our UI uses whole Naira. */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100)
}

export async function verifyPaystackTransaction(reference: string): Promise<{
  ok: boolean
  status?: string
  error?: string
  /** From initialize metadata.order_id — used to mark the order paid without orders.paystack_reference */
  orderId?: number
  userId?: string
  amountKobo?: number
}> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return { ok: false, error: "PAYSTACK_SECRET_KEY is not set" }
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  })

  const json = (await res.json().catch(() => null)) as {
    status?: boolean
    message?: string
    data?: {
      status?: string
      amount?: number
      metadata?: Record<string, unknown>
    }
  }

  if (!res.ok || !json?.status) {
    return { ok: false, error: json?.message || "Verification failed" }
  }

  const paymentStatus = json.data?.status
  const data = json.data
  const meta = data?.metadata
  const orderId = parseOrderIdFromPaystackMetadata(meta)
  const userIdFromMeta =
    meta && typeof meta.user_id === "string"
      ? meta.user_id
      : meta && typeof meta.userId === "string"
        ? meta.userId
        : undefined

  return {
    ok: paymentStatus === "success",
    status: paymentStatus,
    orderId: orderId ?? undefined,
    userId: userIdFromMeta,
    amountKobo: typeof data?.amount === "number" ? data.amount : undefined,
  }
}

/** Paystack echoes custom metadata on verify; we use order_id to link payment → row (no DB column needed). */
function parseOrderIdFromPaystackMetadata(meta: Record<string, unknown> | undefined): number | null {
  if (!meta) return null
  const raw = meta.order_id ?? meta.orderId
  if (raw == null) return null
  const n = typeof raw === "number" ? raw : parseInt(String(raw), 10)
  return Number.isFinite(n) ? n : null
}
