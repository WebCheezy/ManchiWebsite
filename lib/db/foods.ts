import { unstable_noStore as noStore } from "next/cache"
import { getBackendFoodById, getMenuSnapshot } from "./menu-backend.server"
import type { FoodWithCategory } from "./types"

export interface GetFoodsOptions {
  categoryId?: number | null
  search?: string | null
  includeUnavailable?: boolean
}

async function enrichFoodList(foods: FoodWithCategory[]): Promise<FoodWithCategory[]> {
  return foods
}

export async function getFoods(options: GetFoodsOptions = {}): Promise<FoodWithCategory[]> {
  noStore()

  const { categoryId, search, includeUnavailable = false } = options
  const snapshot = await getMenuSnapshot()

  let foods = [...snapshot.foods]

  if (!includeUnavailable) {
    foods = foods.filter((food) => food.is_available)
  }

  if (categoryId != null) {
    foods = foods.filter((food) => food.category_id === categoryId)
  }

  if (search && search.trim()) {
    const query = search.trim().toLowerCase()
    foods = foods.filter(
      (food) =>
        food.name.toLowerCase().includes(query) ||
        food.description?.toLowerCase().includes(query) ||
        food.category?.name.toLowerCase().includes(query)
    )
  }

  return enrichFoodList(foods)
}

export async function getFoodById(id: number): Promise<FoodWithCategory | null> {
  noStore()
  return getBackendFoodById(id)
}

/** Food with enriched option groups and computed menu_price (detail page). */
export async function getFoodWithPricing(id: number): Promise<FoodWithCategory | null> {
  noStore()
  return getBackendFoodById(id)
}

export async function searchFoods(query: string): Promise<FoodWithCategory[]> {
  if (!query.trim()) return []
  return getFoods({ search: query })
}
