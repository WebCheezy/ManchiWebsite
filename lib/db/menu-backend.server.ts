import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { getUser } from "@/lib/auth.server"
import { resolveStoreLocationFromAddress, normalizeStoreLocation } from "@/lib/location/branch"
import { getServerClient } from "./server"
import { effectiveMenuPrice, fetchPublicOptionGroupsForFood } from "./pricing.server"
import { getAddresses } from "./addresses.server"
import type {
  Address,
  AvailabilityStatus,
  Category,
  FoodWithCategory,
  OptionGroup,
  OptionGroupSide,
  StoreLocation,
} from "./types"

type MenuSnapshot = {
  categories: Category[]
  foods: FoodWithCategory[]
}

const STORE_LOCATION_COOKIE = "manchi-store-location"

function getBackendUrl(): string {
  const url = process.env.BACKEND_URL?.trim().replace(/\/$/, "")
  if (!url) {
    throw new Error("BACKEND_URL is required to fetch menu data from manchicodes.")
  }
  return url
}

function toNumber(value: unknown, fallback = 0): number {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function toNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function normalizeStatus(value: unknown): AvailabilityStatus {
  const status = typeof value === "string" ? value.toLowerCase() : "available"
  if (status === "out_of_stock" || status === "unavailable" || status === "available") return status
  return "available"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeCategory(raw: unknown): Category | null {
  if (!isRecord(raw)) return null

  const id = toNumber(raw.id, NaN)
  const name = typeof raw.name === "string" ? raw.name : ""
  if (!Number.isFinite(id) || !name) return null

  return {
    id,
    name,
    image_url: toStringOrNull(raw.image_url),
    created_at: toStringOrNull(raw.created_at) ?? "",
  }
}

function normalizeOptionSide(raw: unknown): OptionGroupSide | null {
  if (!isRecord(raw)) return null

  const id = toNumber(raw.id, NaN)
  const name = typeof raw.name === "string" ? raw.name : ""
  if (!Number.isFinite(id) || !name) return null

  return {
    id,
    name,
    price: toNumber(raw.price),
    price_delta: toNumber(raw.price_delta),
    is_pricing_default: Boolean(raw.is_pricing_default),
    type: toStringOrNull(raw.type),
    image_url: toStringOrNull(raw.image_url),
    option_group_id: toNullableNumber(raw.option_group_id),
  }
}

function normalizeOptionGroup(raw: unknown): OptionGroup | null {
  if (!isRecord(raw)) return null

  const id = toNumber(raw.id, NaN)
  const name = typeof raw.name === "string" ? raw.name : ""
  if (!Number.isFinite(id) || !name) return null

  const sides = Array.isArray(raw.sides)
    ? raw.sides.map(normalizeOptionSide).filter((side): side is OptionGroupSide => side !== null)
    : []

  return {
    id,
    name,
    is_required: Boolean(raw.is_required),
    min_selections: toNumber(raw.min_selections),
    max_selections: Math.max(1, toNumber(raw.max_selections, 1)),
    display_order: toNumber(raw.display_order),
    default_side_id: toNullableNumber(raw.default_side_id),
    pricing_default_side_id: toNullableNumber(raw.pricing_default_side_id),
    sides,
  }
}

function normalizeFood(
  raw: unknown,
  categoryOverride?: Category | null
): FoodWithCategory | null {
  if (!isRecord(raw)) return null

  const id = toNumber(raw.id, NaN)
  const name = typeof raw.name === "string" ? raw.name : ""
  if (!Number.isFinite(id) || !name) return null

  const category =
    categoryOverride ??
    normalizeCategory(raw.category) ??
    (isRecord(raw.category)
      ? null
      : Number.isFinite(toNumber(raw.category_id, NaN)) && typeof raw.category_name === "string"
        ? {
            id: toNumber(raw.category_id),
            name: raw.category_name,
            image_url: null,
            created_at: "",
          }
        : null)

  const optionGroups = Array.isArray(raw.option_groups)
    ? raw.option_groups.map(normalizeOptionGroup).filter((group): group is OptionGroup => group !== null)
    : []

  const status = normalizeStatus(raw.status ?? raw.availability_status ?? raw.availability)

  return {
    id,
    category_id: category?.id ?? toNullableNumber(raw.category_id),
    name,
    description: toStringOrNull(raw.description),
    price: toNumber(raw.base_price ?? raw.price),
    display_price: toNullableNumber(raw.display_price),
    image_url: toStringOrNull(raw.image_url),
    is_available: status !== "unavailable" && raw.is_available !== false,
    created_at: toStringOrNull(raw.created_at) ?? "",
    category,
    base_price: toNumber(raw.base_price ?? raw.price),
    menu_price: toNumber(raw.menu_price ?? raw.display_price ?? raw.base_price ?? raw.price),
    has_customization: optionGroups.length > 0,
    option_groups: optionGroups,
  }
}

function normalizeMenuSnapshot(payload: unknown): MenuSnapshot {
  const root = isRecord(payload) ? payload : {}
  const categoryCandidates = Array.isArray(payload)
    ? payload
    : Array.isArray(root.categories)
      ? root.categories
      : Array.isArray(root.data) && root.data.every(isRecord)
        ? root.data
        : Array.isArray(root.data?.categories)
          ? root.data.categories
          : []

  const foods: FoodWithCategory[] = []
  const categoryMap = new Map<number, Category>()

  for (const rawCategory of categoryCandidates) {
    const category = normalizeCategory(rawCategory)
    if (!category) continue
    categoryMap.set(category.id, category)

    const categoryRecord = rawCategory as Record<string, unknown>
    const rawFoods = Array.isArray(categoryRecord.foods)
      ? categoryRecord.foods
      : Array.isArray(categoryRecord.items)
        ? categoryRecord.items
        : []

    for (const rawFood of rawFoods) {
      const food = normalizeFood(rawFood, category)
      if (food) foods.push(food)
    }
  }

  const flatFoods = Array.isArray(root.foods)
    ? root.foods
    : Array.isArray(root.data?.foods)
      ? root.data.foods
      : []

  for (const rawFood of flatFoods) {
    const food = normalizeFood(rawFood)
    if (!food) continue
    if (!foods.some((existing) => existing.id === food.id)) {
      foods.push(food)
    }
    if (food.category) {
      categoryMap.set(food.category.id, food.category)
    }
  }

  const categories = Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  return { categories, foods }
}

async function getLocalMenuSnapshot(): Promise<MenuSnapshot> {
  const supabase = await getServerClient()

  const [{ data: categoryRows, error: categoryError }, { data: foodRows, error: foodError }] = await Promise.all([
    supabase.from("categories").select("id, name, image_url, created_at").order("name"),
    supabase.from("foods").select("*, category:categories(id, name)").order("created_at", { ascending: false }),
  ])

  if (categoryError) {
    console.error("[menu-backend] Local category fallback failed:", categoryError.message)
  }

  if (foodError) {
    console.error("[menu-backend] Local food fallback failed:", foodError.message)
  }

  const categories = ((categoryRows ?? []) as Category[]).sort((a, b) => a.name.localeCompare(b.name))
  const foods = await Promise.all(
    ((foodRows ?? []) as FoodWithCategory[]).map(async (food) => {
      const optionGroups = await fetchPublicOptionGroupsForFood(food.id)
      return {
        ...food,
        base_price: food.price,
        menu_price: effectiveMenuPrice(food, optionGroups),
        has_customization: optionGroups.length > 0,
        option_groups: optionGroups,
      }
    })
  )

  return { categories, foods }
}

const resolveCurrentLocation = cache(async (): Promise<StoreLocation> => {
  const cookieStore = await cookies()
  const cookieLocation = cookieStore.get(STORE_LOCATION_COOKIE)?.value
  if (cookieLocation) {
    return normalizeStoreLocation(cookieLocation)
  }

  const user = await getUser()
  if (user?.id) {
    const addresses = await getAddresses(user.id)
    const defaultAddress =
      addresses.find((address) => address.is_default) ??
      addresses[0] ??
      null

    if (defaultAddress) {
      return resolveStoreLocationFromAddress(defaultAddress as Address)
    }
  }

  return "Chasemall"
})

const fetchMenuSnapshotByLocation = cache(async (location: StoreLocation): Promise<MenuSnapshot> => {
  const backendUrl = getBackendUrl()
  try {
    const response = await fetch(`${backendUrl}/api/menu?location=${encodeURIComponent(location)}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.warn(`[menu-backend] Backend menu fetch failed for ${location} with ${response.status}. Using local fallback.`)
      return getLocalMenuSnapshot()
    }

    const payload = await response.json()
    return normalizeMenuSnapshot(payload)
  } catch (error) {
    console.warn(
      `[menu-backend] Backend menu fetch errored for ${location}. Using local fallback.`,
      error
    )
    return getLocalMenuSnapshot()
  }
})

export async function getMenuSnapshot(): Promise<MenuSnapshot> {
  const location = await resolveCurrentLocation()
  return fetchMenuSnapshotByLocation(location)
}

export async function getMenuSnapshotForLocation(location: StoreLocation): Promise<MenuSnapshot> {
  return fetchMenuSnapshotByLocation(location)
}

export async function getCurrentMenuLocation(): Promise<StoreLocation> {
  return resolveCurrentLocation()
}

export async function getBackendFoodById(id: number): Promise<FoodWithCategory | null> {
  const location = await resolveCurrentLocation()
  const backendUrl = getBackendUrl()
  try {
    const response = await fetch(
      `${backendUrl}/api/foods?id=${encodeURIComponent(String(id))}&location=${encodeURIComponent(location)}`,
      { cache: "no-store" }
    )

    if (response.ok) {
      const payload = await response.json()

      const root = isRecord(payload) ? payload : {}
      const rawFood =
        (isRecord(root.food) && root.food) ||
        (isRecord(root.data) && root.data) ||
        (Array.isArray(payload) ? payload[0] : null) ||
        (Array.isArray(root.foods) ? root.foods[0] : null)

      const food = normalizeFood(rawFood)
      if (food) return food
    } else {
      console.warn(`[menu-backend] Backend food fetch failed for id=${id} with ${response.status}. Using fallback.`)
    }
  } catch (error) {
    console.warn(`[menu-backend] Backend food fetch errored for id=${id}. Using fallback.`, error)
  }

  const snapshot = await fetchMenuSnapshotByLocation(location)
  return snapshot.foods.find((item) => item.id === id) ?? null
}
