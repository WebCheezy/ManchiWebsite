import { getServerClient } from "./server"
import type { Side, SideForFood } from "./types"

/**
 * Get all available sides
 */
export async function getSides(): Promise<Side[]> {
  const supabase = await getServerClient()

  const { data, error } = await supabase
    .from("sides")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("[getSides] Error fetching sides:", error)
    return []
  }

  return data as Side[]
}

/**
 * Get a single side by ID
 */
export async function getSideById(id: number): Promise<Side | null> {
  const supabase = await getServerClient()

  const { data, error } = await supabase
    .from("sides")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Side
}

/**
 * Get all sides available for a specific food item
 * Returns sides with their is_required status
 */
export async function getSidesForFood(foodId: number): Promise<SideForFood[]> {
  const supabase = await getServerClient()

  const { data, error } = await supabase
    .from("food_sides")
    .select(`
      is_required,
      side:sides(*)
    `)
    .eq("food_id", foodId)

  if (error) {
    console.error("[getSidesForFood] Error fetching sides for food:", error)
    return []
  }

  if (!data) return []

  // Transform the nested data structure
  return data
    .filter((item) => item.side !== null)
    .map((item) => ({
      ...(item.side as Side),
      is_required: item.is_required,
    }))
}

/**
 * Get sides grouped by type (e.g., "protein", "drink", "extra")
 */
export async function getSidesGroupedByType(): Promise<Record<string, Side[]>> {
  const sides = await getSides()
  
  return sides.reduce((grouped, side) => {
    const type = side.type || "other"
    if (!grouped[type]) {
      grouped[type] = []
    }
    grouped[type].push(side)
    return grouped
  }, {} as Record<string, Side[]>)
}

/**
 * Get sides for a food, grouped by required/optional
 */
export async function getSidesForFoodGrouped(foodId: number): Promise<{
  required: SideForFood[]
  optional: SideForFood[]
}> {
  const sides = await getSidesForFood(foodId)
  
  return {
    required: sides.filter((s) => s.is_required),
    optional: sides.filter((s) => !s.is_required),
  }
}
