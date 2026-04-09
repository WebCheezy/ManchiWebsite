import { getServerClient } from "./server"
import type { Food, FoodWithCategory } from "./types"

export interface GetFoodsOptions {
  categoryId?: number | null
  search?: string | null
  includeUnavailable?: boolean
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

  return (data ?? []) as FoodWithCategory[]
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

export async function searchFoods(query: string): Promise<FoodWithCategory[]> {
  if (!query.trim()) return []
  return getFoods({ search: query })
}
