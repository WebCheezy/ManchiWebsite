import { NextResponse } from "next/server"
import { nairaToKobo } from "@/lib/paystack.server"

export async function POST(req: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json(
      { error: "PAYSTACK_SECRET_KEY is not set" },
      { status: 500 }
    )
  }

  const body = (await req.json().catch(() => null)) as
    | { email?: string; amount?: number; callback_url?: string; metadata?: unknown }
    | null

  const email = body?.email
  const amount = body?.amount
  const callback_url = body?.callback_url

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 400 })
  }
  if (!amount || typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 })
  }

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: nairaToKobo(amount), // UI amounts are whole Naira; Paystack uses kobo
      ...(callback_url ? { callback_url } : {}),
      ...(body?.metadata ? { metadata: body.metadata } : {}),
    }),
  })

  const json = (await res.json().catch(() => null)) as any

  if (!res.ok) {
    return NextResponse.json(
      { error: json?.message || "Paystack initialization failed" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    authorization_url: json?.data?.authorization_url,
    reference: json?.data?.reference,
    access_code: json?.data?.access_code,
  })
}

