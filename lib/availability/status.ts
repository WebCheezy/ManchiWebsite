import type { AvailabilityStatus, StoreLocation } from "@/lib/db/types"
import { STORE_LOCATIONS } from "@/lib/location/branch"

/** Serialized maps from the server (JSON-safe string keys). */
export type SerializedFoodAvailability = Record<string, Record<string, AvailabilityStatus>>
export type SerializedSideAvailability = Record<string, Record<string, AvailabilityStatus>>

export type FoodMenuUiStatus = "available" | "out_of_stock" | "hidden"

export function emptySerializedFoodAvailability(): SerializedFoodAvailability {
  return { Chasemall: {}, Aurora: {}, Eromo: {} }
}

export function emptySerializedSideAvailability(): SerializedSideAvailability {
  return { Chasemall: {}, Aurora: {}, Eromo: {} }
}

function statusForFood(
  foodId: number,
  location: StoreLocation,
  maps: SerializedFoodAvailability | undefined
): AvailabilityStatus | undefined {
  if (!maps?.[location]) return undefined
  return maps[location][String(foodId)]
}

function statusForSide(
  sideId: number,
  location: StoreLocation,
  maps: SerializedSideAvailability | undefined
): AvailabilityStatus | undefined {
  if (!maps?.[location]) return undefined
  return maps[location][String(sideId)]
}

/**
 * - Globally off (`is_available` false) → hidden.
 * - Row `unavailable` → hidden (not listed for this branch).
 * - Row `out_of_stock` → shown, not orderable.
 * - No row or `available` → normal.
 */
export function foodMenuUiStatus(
  food: { id: number; is_available: boolean },
  storeLocation: StoreLocation,
  maps: SerializedFoodAvailability | undefined
): FoodMenuUiStatus {
  if (!food.is_available) return "hidden"
  const row = statusForFood(food.id, storeLocation, maps)
  if (row === "unavailable") return "hidden"
  if (row === "out_of_stock") return "out_of_stock"
  return "available"
}

export type SideMenuUiStatus = "available" | "out_of_stock" | "hidden"

export function sideMenuUiStatus(
  sideId: number,
  storeLocation: StoreLocation,
  maps: SerializedSideAvailability | undefined
): SideMenuUiStatus {
  const row = statusForSide(sideId, storeLocation, maps)
  if (row === "unavailable") return "hidden"
  if (row === "out_of_stock") return "out_of_stock"
  return "available"
}

/** Guests / no delivery address: only global `is_available`; otherwise branch tables apply. */
export function effectiveFoodMenuUiStatus(
  food: { id: number; is_available: boolean },
  applyBranchAvailability: boolean,
  storeLocation: StoreLocation,
  maps: SerializedFoodAvailability | undefined
): FoodMenuUiStatus {
  if (!applyBranchAvailability) {
    return food.is_available ? "available" : "hidden"
  }
  return foodMenuUiStatus(food, storeLocation, maps)
}

export function effectiveSideMenuUiStatus(
  sideId: number,
  applyBranchAvailability: boolean,
  storeLocation: StoreLocation,
  maps: SerializedSideAvailability | undefined
): SideMenuUiStatus {
  if (!applyBranchAvailability) return "available"
  return sideMenuUiStatus(sideId, storeLocation, maps)
}

export function isStoreLocation(value: string): value is StoreLocation {
  return STORE_LOCATIONS.includes(value as StoreLocation)
}
