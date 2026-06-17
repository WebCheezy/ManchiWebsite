import "server-only"
import { getServerClient } from "./server"
import { getSidesForFood } from "./sides"
import type { Food, OptionGroup, OptionGroupSide, Side } from "./types"

type RawOptionGroup = {
  id: number
  food_id: number
  name: string
  min_selections: number
  max_selections: number
  is_required: boolean
  display_order: number
  default_side_id: number | null
}

/** Which side is bundled in menu price for a group (admin default, else cheapest). */
export function resolvePricingDefaultSideId(group: {
  default_side_id: number | null
  sides: Pick<OptionGroupSide, "id" | "price">[]
}): number | null {
  if (group.default_side_id != null) {
    const exists = group.sides.some((s) => s.id === group.default_side_id)
    if (exists) return group.default_side_id
  }
  if (group.sides.length === 0) return null
  return group.sides.reduce((min, s) => (s.price < min.price ? s : min)).id
}

export function enrichOptionGroupsWithPricing(
  groups: Array<RawOptionGroup & { sides: Side[] }>
): OptionGroup[] {
  return groups.map((group) => {
    const sides: OptionGroupSide[] = group.sides.map((side) => ({
      id: side.id,
      name: side.name,
      price: side.price,
      type: side.type,
      image_url: side.image_url,
      option_group_id: side.option_group_id,
      price_delta: 0,
      is_pricing_default: false,
    }))

    const pricingDefaultSideId = resolvePricingDefaultSideId({
      default_side_id: group.default_side_id,
      sides,
    })
    const defaultPrice =
      pricingDefaultSideId != null
        ? (sides.find((s) => s.id === pricingDefaultSideId)?.price ?? 0)
        : 0

    const enrichedSides = sides.map((side) => ({
      ...side,
      price_delta:
        pricingDefaultSideId != null
          ? Math.max(0, side.price - defaultPrice)
          : side.price,
      is_pricing_default: side.id === pricingDefaultSideId,
    }))

    return {
      id: group.id,
      name: group.name,
      is_required: group.is_required,
      min_selections: group.min_selections,
      max_selections: group.max_selections,
      display_order: group.display_order,
      default_side_id: group.default_side_id,
      pricing_default_side_id: pricingDefaultSideId,
      sides: enrichedSides,
    }
  })
}

export function effectiveMenuPrice(
  food: Pick<Food, "price" | "display_price">,
  groups: OptionGroup[]
): number {
  if (groups.length > 0) {
    let included = 0
    for (const group of groups) {
      const defId = group.pricing_default_side_id
      if (defId != null) {
        const side = group.sides.find((s) => s.id === defId)
        if (side) included += side.price
      }
    }
    return food.price + included
  }
  if (food.display_price != null && food.display_price > 0) {
    return food.display_price
  }
  return food.price
}

async function buildLegacyGroupsFromFoodSides(foodId: number): Promise<
  Array<RawOptionGroup & { sides: Side[] }>
> {
  const sidesForFood = await getSidesForFood(foodId)
  if (sidesForFood.length === 0) return []

  const withGroupId = sidesForFood.filter((s) => s.option_group_id != null)
  if (withGroupId.length > 0) {
    const byGroup = new Map<number, typeof sidesForFood>()
    for (const side of withGroupId) {
      const gid = side.option_group_id!
      if (!byGroup.has(gid)) byGroup.set(gid, [])
      byGroup.get(gid)!.push(side)
    }
    return Array.from(byGroup.entries()).map(([gid, sides], index) => ({
      id: gid,
      food_id: foodId,
      name: "Options",
      min_selections: sides.some((s) => s.is_required) ? 1 : 0,
      max_selections: 1,
      is_required: sides.some((s) => s.is_required),
      display_order: index,
      default_side_id: null,
      sides: sides as Side[],
    }))
  }

  const required = sidesForFood.filter((s) => s.is_required)
  const optional = sidesForFood.filter((s) => !s.is_required)
  const result: Array<RawOptionGroup & { sides: Side[] }> = []

  if (required.length > 0) {
    result.push({
      id: -1,
      food_id: foodId,
      name: "Choose your side",
      min_selections: 1,
      max_selections: 1,
      is_required: true,
      display_order: 0,
      default_side_id: null,
      sides: required as Side[],
    })
  }
  if (optional.length > 0) {
    result.push({
      id: -2,
      food_id: foodId,
      name: "Add extras",
      min_selections: 0,
      max_selections: optional.length,
      is_required: false,
      display_order: 1,
      default_side_id: null,
      sides: optional as Side[],
    })
  }
  return result
}

/** Load option groups with sides; falls back to food_sides when groups are missing. */
export async function fetchPublicOptionGroupsForFood(foodId: number): Promise<OptionGroup[]> {
  const supabase = await getServerClient()

  const { data: groups, error } = await supabase
    .from("option_groups")
    .select("*")
    .eq("food_id", foodId)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("[fetchPublicOptionGroupsForFood]", error.message)
  }

  let rawGroups: Array<RawOptionGroup & { sides: Side[] }>

  if (groups && groups.length > 0) {
    const groupIds = groups.map((g) => g.id)
    const { data: allSides } = await supabase.from("sides").select("*").in("option_group_id", groupIds)

    rawGroups = (groups as RawOptionGroup[]).map((g) => ({
      ...g,
      sides: ((allSides ?? []) as Side[]).filter((s) => s.option_group_id === g.id),
    }))
  } else {
    rawGroups = await buildLegacyGroupsFromFoodSides(foodId)
  }

  return enrichOptionGroupsWithPricing(rawGroups)
}

export async function foodIdsWithOptionGroups(foodIds: number[]): Promise<Set<number>> {
  if (foodIds.length === 0) return new Set()
  const supabase = await getServerClient()
  const { data } = await supabase.from("option_groups").select("food_id").in("food_id", foodIds)
  return new Set((data ?? []).map((r) => r.food_id as number))
}
