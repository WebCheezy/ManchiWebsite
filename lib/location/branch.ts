import type { Address, StoreLocation } from "@/lib/db/types"

export const STORE_LOCATIONS: StoreLocation[] = ["Chasemall", "Eromo"]

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase()
}

/**
 * Maps a delivery address to the fulfillment branch (`food_availability.location` / `side_availability.location`).
 * Enugu → Chasemall. Rivers State → Eromo.
 */
export function resolveStoreLocationFromAddress(address: Address | null): StoreLocation {
  if (!address) return "Chasemall"

  const state = norm(address.state)
  const lga = norm(address.lga)

  if (state.includes("enugu")) {
    return "Chasemall"
  }

  const isRivers =
    state.includes("rivers") || lga.includes("port harcourt") || state.includes("port harcourt")

  if (isRivers) {
    return "Eromo"
  }

  return "Chasemall"
}

export function getBranchDisplayInfo(location: StoreLocation): { label: string; subtitle: string } {
  switch (location) {
    case "Chasemall":
      return {
        label: "Chasemall · Enugu",
        subtitle: "33, Abakaliki Road by 38 Bus Stop, GRA, Enugu, Enugu State",
      }
    case "Eromo":
      return {
        label: "Eromo · Port Harcourt",
        subtitle: "Opposite Eromo Filling Station, New Road Eneka Atali Road, Rivers State",
      }
    default:
      return { label: "Manchi", subtitle: "" }
  }
}

/** Legacy stored value — map to a valid branch. */
export function normalizeStoreLocation(value: string | null | undefined): StoreLocation {
  if (value === "Eromo" || value === "Chasemall") return value
  if (value === "Aurora") return "Eromo"
  return "Chasemall"
}
