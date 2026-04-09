import type { Address, AddressInput, DefaultAddressSummary } from "./types"
import { addressShortLabel } from "@/lib/format"

// ─── Client-side functions (for Client Components) ─────────────────────────

async function parseErrorMessage(res: Response): Promise<string> {
  const json = (await res.json().catch(() => null)) as { error?: string } | null
  return json?.error ?? `Request failed (${res.status})`
}

/** Create a new address */
export async function createAddress(userId: string, input: AddressInput): Promise<Address | null> {
  const res = await fetch("/api/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      ...input,
    }),
  })
  if (!res.ok) {
    console.error("[createAddress]", await parseErrorMessage(res))
    return null
  }
  return (await res.json()) as Address
}

/** Update an existing address */
export async function updateAddress(id: string, userId: string, input: Partial<AddressInput>): Promise<Address | null> {
  const res = await fetch(`/api/addresses/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      ...input,
    }),
  })
  if (!res.ok) {
    console.error("[updateAddress]", await parseErrorMessage(res))
    return null
  }
  return (await res.json()) as Address
}

/** Delete an address */
export async function deleteAddress(id: string, userId: string): Promise<boolean> {
  const res = await fetch(`/api/addresses/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) {
    console.error("[deleteAddress]", await parseErrorMessage(res))
    return false
  }
  return true
}

/** Set an address as the default (and unset others) */
export async function setDefaultAddress(id: string, userId: string): Promise<boolean> {
  const res = await fetch(`/api/addresses/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, is_default: true }),
  })
  if (!res.ok) {
    console.error("[setDefaultAddress]", await parseErrorMessage(res))
    return false
  }
  return true
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function toDefaultAddressSummary(a: Address): DefaultAddressSummary {
  return {
    id: a.id,
    title: a.title,
    area: a.area,
    street: a.street,
    house_number: a.house_number,
    shortLabel: addressShortLabel(a.area, a.street, a.house_number),
  }
}

export function formatAddressFull(a: Address): string {
  return [a.house_number, a.street, a.area, a.lga, a.state].filter(Boolean).join(", ")
}
