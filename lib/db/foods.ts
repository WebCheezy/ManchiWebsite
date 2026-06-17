import { getServerClient } from "./server"
import {
  effectiveMenuPrice,
  fetchPublicOptionGroupsForFood,
  foodIdsWithOptionGroups,
} from "./pricing.server"
import type { FoodWithCategory } from "./types"

export interface GetFoodsOptions {
  categoryId?: number | null
  search?: string | null
  includeUnavailable?: boolean
}

function enrichFoodList(
  foods: FoodWithCategory[],
  customizationIds: Set<number>
): FoodWithCategory[] {
  return foods.map((food) => ({
    ...food,
    base_price: food.price,
    menu_price: food.display_price ?? food.price,
    has_customization: customizationIds.has(food.id),
  }))
}

export async function getFoods(options: GetFoodsOptions = {}): Promise<FoodWithCategory[]> {
  const { categoryId, search, includeUnavailable = false } = options
  const supabase = await getServerClient()

  let query = supabase
    .from("foods")
    .select("*, category:categories(id, name)")
    .order("created_at", { ascending: false })

  if (!includeUnavailable) {
    query = query.eq("is_available", true)
  }

  if (categoryId != null) {
    query = query.eq("category_id", categoryId)
  }

  if (search && search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("[getFoods]", error.message)
    return []
  }

  const foods = (data ?? []) as FoodWithCategory[]
  const customizationIds = await foodIdsWithOptionGroups(foods.map((f) => f.id))
  return enrichFoodList(foods, customizationIds)
}

export async function getFoodById(id: number): Promise<FoodWithCategory | null> {
  const supabase = await getServerClient()
  const { data, error } = await supabase
    .from("foods")
    .select("*, category:categories(id, name)")
    .eq("id", id)
    .single()

  if (error || !data) return null
  return data as FoodWithCategory
}

/** Food with enriched option groups and computed menu_price (detail page). */
export async function getFoodWithPricing(id: number): Promise<FoodWithCategory | null> {
  const food = await getFoodById(id)
  if (!food) return null

  const option_groups = await fetchPublicOptionGroupsForFood(food.id)
  const menu_price = effectiveMenuPrice(food, option_groups)

  return {
    ...food,
    base_price: food.price,
    menu_price,
    has_customization: option_groups.length > 0,
    option_groups,
  }
}

export async function searchFoods(query: string): Promise<FoodWithCategory[]> {
  if (!query.trim()) return []
  return getFoods({ search: query })
}
