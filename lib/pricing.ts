import type { CartItem, CartSideItem, FoodWithCategory, OptionGroup } from "./db/types"
import { formatPrice } from "@/lib/format"

/** Menu card / listing price. */
export function getMenuPrice(food: Pick<FoodWithCategory, "price" | "display_price" | "menu_price">): number {
  if (food.menu_price != null && food.menu_price > 0) return food.menu_price
  if (food.display_price != null && food.display_price > 0) return food.display_price
  return food.price
}

export function formatOptionPriceLabel(priceDelta: number): string {
  return `+ ₦${formatPrice(priceDelta)}`
}

export function calculateSelectionDeltasTotal(
  sides: Pick<CartSideItem, "price_delta" | "price" | "quantity">[]
): number {
  return sides.reduce((sum, side) => {
    const delta = side.price_delta ?? side.price ?? 0
    return sum + delta * side.quantity
  }, 0)
}

export function calculateUnitTotal(menuPrice: number, sides: CartSideItem[]): number {
  return menuPrice + calculateSelectionDeltasTotal(sides)
}

function usesDeltaPricing(sides: CartSideItem[]): boolean {
  return sides.length === 0 || sides.some((s) => s.price_delta !== undefined)
}

export function calculateCartItemTotal(item: CartItem): number {
  if (!usesDeltaPricing(item.sides)) {
    const sidesTotal = item.sides.reduce((sum, side) => sum + side.price * side.quantity, 0)
    return (item.foodPrice + sidesTotal) * item.quantity
  }
  return calculateUnitTotal(item.foodPrice, item.sides) * item.quantity
}

export type GroupSelection = { groupId: number; sideId: number; quantity: number }

export function selectionsFromGroups(
  optionGroups: OptionGroup[],
  selected: Map<number, Map<number, number>>
): GroupSelection[] {
  const result: GroupSelection[] = []
  for (const group of optionGroups) {
    const groupSel = selected.get(group.id)
    if (!groupSel) continue
    groupSel.forEach((quantity, sideId) => {
      if (quantity > 0) {
        result.push({ groupId: group.id, sideId, quantity })
      }
    })
  }
  return result
}

export function isGroupSelectionValid(
  optionGroups: OptionGroup[],
  selected: Map<number, Map<number, number>>
): boolean {
  for (const group of optionGroups) {
    const groupSel = selected.get(group.id)
    const count = groupSel
      ? Array.from(groupSel.values()).reduce((sum, q) => sum + q, 0)
      : 0
    if (group.is_required && count < Math.max(1, group.min_selections)) return false
    if (count < group.min_selections) return false
    if (count > group.max_selections) return false
  }
  return true
}

export function buildDefaultSelections(optionGroups: OptionGroup[]): Map<number, Map<number, number>> {
  const map = new Map<number, Map<number, number>>()
  for (const group of optionGroups) {
    const defaultSide = group.sides.find((s) => s.is_pricing_default)
    if (!defaultSide) continue
    if (group.max_selections === 1 || group.is_required) {
      map.set(group.id, new Map([[defaultSide.id, 1]]))
    }
  }
  return map
}

export function selectionsToCartSides(
  optionGroups: OptionGroup[],
  selected: Map<number, Map<number, number>>
): CartSideItem[] {
  const sides: CartSideItem[] = []
  for (const group of optionGroups) {
    const groupSel = selected.get(group.id)
    if (!groupSel) continue
    groupSel.forEach((quantity, sideId) => {
      if (quantity <= 0) return
      const side = group.sides.find((s) => s.id === sideId)
      if (!side) return
      sides.push({
        id: side.id,
        name: side.name,
        price: side.price,
        price_delta: side.price_delta,
        quantity,
        image_url: side.image_url,
        group_id: group.id,
      })
    })
  }
  return sides
}
