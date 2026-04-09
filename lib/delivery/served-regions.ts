import raw from "@/lib/data/manchi-served-regions.json"

export type ManchiServedRegion = { state: string; lgas: string[]; alias?: string }

type ManchiServedRegionsFile = {
  baseTransportFeeNaira: number
  regions: ManchiServedRegion[]
}

const data = raw as ManchiServedRegionsFile

/** Replace `lib/data/manchi-served-regions.json` with the file from Manchi (state + lgas). */
export const BASE_TRANSPORT_FEE_NAIRA = data.baseTransportFeeNaira

function normalizeKey(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase()
}

/** Canonical state name -> map normalized LGA -> display LGA string from JSON */
const servedByState = new Map<string, Map<string, string>>()

/** Optional `alias` from JSON (e.g. "enugu") -> canonical state name */
const aliasToStateName = new Map<string, string>()

for (const r of data.regions) {
  const stateKey = r.state.trim()
  if (r.alias?.trim()) {
    aliasToStateName.set(normalizeKey(r.alias), stateKey)
  }
  const lgaMap = new Map<string, string>()
  for (const l of r.lgas) {
    const display = l.trim()
    if (!display) continue
    lgaMap.set(normalizeKey(display), display)
  }
  servedByState.set(stateKey, lgaMap)
}

export function getServedStateNames(): string[] {
  return [...servedByState.keys()].sort((a, b) => a.localeCompare(b))
}

export function getServedLgasForState(stateName: string): string[] {
  const entry = [...servedByState.entries()].find(
    ([k]) => k.toLowerCase() === stateName.trim().toLowerCase()
  )
  if (!entry) return []
  return [...entry[1].values()].sort((a, b) => a.localeCompare(b))
}

/** Map geocoder / free text to a served state name when possible. */
export function resolveServedStateName(rawState: string): string | undefined {
  const t = normalizeKey(rawState)
  if (!t) return undefined

  const fromAlias = aliasToStateName.get(t)
  if (fromAlias) return fromAlias

  if (t.includes("enugu")) {
    return [...servedByState.keys()].find((k) => k.toLowerCase() === "enugu")
  }
  if (t.includes("rivers") || t.includes("port harcourt") || t.includes("ph ")) {
    return [...servedByState.keys()].find((k) => k.toLowerCase() === "rivers")
  }
  if (t.includes("lagos")) {
    return [...servedByState.keys()].find((k) => k.toLowerCase() === "lagos")
  }
  if (t.includes("abuja") || t.includes("federal capital") || t === "fct") {
    return [...servedByState.keys()].find(
      (k) => k.toLowerCase() === "federal capital territory" || k.toLowerCase() === "fct"
    )
  }
  return [...servedByState.keys()].find((k) => k.toLowerCase() === rawState.trim().toLowerCase())
}

export function isServedRegion(state: string, lga: string): boolean {
  return normalizeToServedStateAndLga(state, lga) != null
}

/** Returns canonical state + LGA strings from `manchi-served-regions.json` when the pair is served. */
export function normalizeToServedStateAndLga(
  stateRaw: string,
  lgaRaw: string
): { state: string; lga: string } | null {
  const canonState =
    resolveServedStateName(stateRaw) ??
    [...servedByState.keys()].find((k) => k.toLowerCase() === stateRaw.trim().toLowerCase())
  if (!canonState) return null
  const lgaMap = servedByState.get(canonState)
  if (!lgaMap) return null
  const lga = lgaMap.get(normalizeKey(lgaRaw))
  if (!lga) return null
  return { state: canonState, lga }
}

export function servedRegionErrorMessage(): string {
  return "Manchi only delivers to selected LGAs. Choose a state and LGA from the list, or pick a location inside our service area."
}
