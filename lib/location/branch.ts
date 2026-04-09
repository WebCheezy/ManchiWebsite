import type { Address, StoreLocation } from "@/lib/db/types"

export const STORE_LOCATIONS: StoreLocation[] = ["Chasemall", "Aurora", "Eromo"]

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase()
}

/**
 * Maps a delivery address to the fulfillment branch (`food_availability.location` / `side_availability.location`).
 * Enugu → Chasemall. Rivers State uses area/street keywords, then LGA heuristics.
 */
export function resolveStoreLocationFromAddress(address: Address | null): StoreLocation {
  if (!address) return "Chasemall"

  const state = norm(address.state)
  const lga = norm(address.lga)
  const blob = `${norm(address.area)} ${norm(address.street)}`

  if (state.includes("enugu")) {
    return "Chasemall"
  }

  const isRivers =
    state.includes("rivers") || lga.includes("port harcourt") || state.includes("port harcourt")

  if (!isRivers) {
    return "Chasemall"
  }

  const eromoHints = ["eneka", "eromo", "atali", "new road eneka"]
  if (eromoHints.some((h) => blob.includes(h))) {
    return "Eromo"
  }

  const auroraHints = ["rumuomasi", "aurora", "stadium", "uyo street", "save a life", "rumuola", "rumuigbo"]
  if (auroraHints.some((h) => blob.includes(h))) {
    return "Aurora"
  }

  if (lga === "port harcourt" || lga.includes("obio")) {
    return "Aurora"
  }

  // Other Rivers LGAs → Eromo (suburban Rivers branch)
  return "Eromo"
}

export function getBranchDisplayInfo(location: StoreLocation): { label: string; subtitle: string } {
  switch (location) {
    case "Chasemall":
      return {
        label: "Chasemall · Enugu",
        subtitle: "33, Abakaliki Road by 38 Bus Stop, GRA, Enugu, Enugu State",
      }
    case "Aurora":
      return {
        label: "Port Harcourt — Aurora",
        subtitle: "Opposite Eromo Filling Station, New Road Eneka Atali Road, Rivers State",
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
