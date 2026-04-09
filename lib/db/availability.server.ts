import "server-only"
import type { CartItem } from "./types"
import type { AvailabilityStatus, StoreLocation } from "./types"
import { getServerClient } from "./server"
import { STORE_LOCATIONS } from "@/lib/location/branch"
import type { SerializedFoodAvailability, SerializedSideAvailability } from "@/lib/availability/status"
import { emptySerializedFoodAvailability, emptySerializedSideAvailability } from "@/lib/availability/status"

type FoodAvailRow = { food_id: number | null; location: string; status: AvailabilityStatus | null }
type SideAvailRow = { side_id: number | null; location: string; status: AvailabilityStatus | null }

function normalizeStatus(s: string | null | undefined): AvailabilityStatus {
  const t = (s ?? "available").toLowerCase()
  if (t === "unavailable" || t === "out_of_stock" || t === "available") return t
  return "available"
}

function isValidLocation(loc: string): loc is StoreLocation {
  return STORE_LOCATIONS.includes(loc as StoreLocation)
}

export async function getSerializedFoodAvailability(): Promise<SerializedFoodAvailability> {
  const base = emptySerializedFoodAvailability()
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from("food_availability")
    .select("food_id, location, status")

  if (error) {
    console.warn("[getSerializedFoodAvailability]", error.message)
    return base
  }

  for (const row of (data ?? []) as FoodAvailRow[]) {
    if (row.food_id == null || !isValidLocation(row.location)) continue
    base[row.location][String(row.food_id)] = normalizeStatus(row.status ?? undefined)
  }
  return base
}

export async function getSerializedSideAvailability(): Promise<SerializedSideAvailability> {
  const base = emptySerializedSideAvailability()
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from("side_availability")
    .select("side_id, location, status")

  if (error) {
    console.warn("[getSerializedSideAvailability]", error.message)
    return base
  }

  for (const row of (data ?? []) as SideAvailRow[]) {
    if (row.side_id == null || !isValidLocation(row.location)) continue
    base[row.location][String(row.side_id)] = normalizeStatus(row.status ?? undefined)
  }
  return base
}

export async function assertCartAvailableAtLocation(
  items: CartItem[],
  location: StoreLocation
): Promise<string | null> {
  const [foodMaps, sideMaps] = await Promise.all([
    getSerializedFoodAvailability(),
    getSerializedSideAvailability(),
  ])

  for (const item of items) {
    const fs = foodMaps[location]?.[String(item.foodId)]
    if (fs === "unavailable") {
      return `"${item.foodName}" is not available at this branch. Remove it or switch location.`
    }
    if (fs === "out_of_stock") {
      return `"${item.foodName}" is out of stock at this branch.`
    }

    for (const s of item.sides) {
      const ss = sideMaps[location]?.[String(s.id)]
      if (ss === "unavailable") {
        return `Add-on "${s.name}" is not available at this branch.`
      }
      if (ss === "out_of_stock") {
        return `Add-on "${s.name}" is out of stock at this branch.`
      }
    }
  }

  return null
}
