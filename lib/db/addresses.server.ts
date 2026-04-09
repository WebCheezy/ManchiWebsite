import "server-only"
import { getServerClient } from "./server"
import { getSupabaseAdmin, hasServiceRoleKey } from "./supabase-admin"
import type { Address, DefaultAddressSummary } from "./types"
import { toDefaultAddressSummary } from "./addresses"

// ─── Server-side functions (for Server Components) ─────────────────────────
async function getDbForAddresses() {
  if (hasServiceRoleKey()) {
    return getSupabaseAdmin()
  }
  return await getServerClient()
}

/** Get all addresses for a user */
export async function getAddresses(userId: string): Promise<Address[]> {
  const supabase = await getDbForAddresses()
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getAddresses]", error.message)
    return []
  }
  return (data ?? []) as Address[]
}

/** Get the user's default address */
export async function getDefaultAddress(userId: string): Promise<DefaultAddressSummary | null> {
  const supabase = await getDbForAddresses()
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .single()

  if (error || !data) return null
  return toDefaultAddressSummary(data as Address)
}

/** Get a single address by ID */
export async function getAddressById(id: string): Promise<Address | null> {
  const supabase = await getDbForAddresses()
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return null
  return data as Address
}

/** Single address row scoped to user (for API validation) */
export async function getAddressByIdForUser(id: string, userId: string): Promise<Address | null> {
  const supabase = await getDbForAddresses()
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) return null
  return data as Address
}

export async function createAddressForUser(input: {
  userId: string
  title?: string | null
  state: string
  lga: string
  area: string
  street: string
  house_number: string
  is_default?: boolean
}): Promise<Address | null> {
  const supabase = await getDbForAddresses()

  if (input.is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", input.userId)
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: input.userId,
      title: input.title || null,
      state: input.state,
      lga: input.lga,
      area: input.area,
      street: input.street,
      house_number: input.house_number,
      is_default: input.is_default ?? false,
    })
    .select("*")
    .single()

  if (error) {
    console.error("[createAddressForUser]", error.message)
    return null
  }
  return data as Address
}

export async function updateAddressForUser(input: {
  id: string
  userId: string
  title?: string | null
  state?: string
  lga?: string
  area?: string
  street?: string
  house_number?: string
  is_default?: boolean
}): Promise<Address | null> {
  const supabase = await getDbForAddresses()

  if (input.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", input.userId)
      .neq("id", input.id)
  }

  const { data, error } = await supabase
    .from("addresses")
    .update({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.state !== undefined && { state: input.state }),
      ...(input.lga !== undefined && { lga: input.lga }),
      ...(input.area !== undefined && { area: input.area }),
      ...(input.street !== undefined && { street: input.street }),
      ...(input.house_number !== undefined && { house_number: input.house_number }),
      ...(input.is_default !== undefined && { is_default: input.is_default }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .eq("user_id", input.userId)
    .select("*")
    .single()

  if (error) {
    console.error("[updateAddressForUser]", error.message)
    return null
  }
  return data as Address
}

export async function deleteAddressForUser(input: { id: string; userId: string }): Promise<boolean> {
  const supabase = await getDbForAddresses()
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", input.id)
    .eq("user_id", input.userId)

  if (error) {
    console.error("[deleteAddressForUser]", error.message)
    return false
  }
  return true
}
