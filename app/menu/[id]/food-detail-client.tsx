"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import Link from "next/link"
import { Plus, Minus, ShoppingCart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptionGroupsSelector, type GroupSelections } from "@/components/option-groups-selector"
import { useCart } from "@/lib/cart"
import type { FoodWithCategory } from "@/lib/db/types"
import { formatPrice } from "@/lib/format"
import {
  buildDefaultSelections,
  calculateSelectionDeltasTotal,
  calculateUnitTotal,
  formatOptionPriceLabel,
  isGroupSelectionValid,
  selectionsToCartSides,
} from "@/lib/pricing"
import { useAvailability } from "@/lib/availability/availability-context"
import { effectiveFoodMenuUiStatus, effectiveSideMenuUiStatus } from "@/lib/availability/status"
import { useBranchAvailability } from "@/lib/browse/branch-availability-context"

interface FoodDetailClientProps {
  food: FoodWithCategory
}

export function FoodDetailClient({ food }: FoodDetailClientProps) {
  const optionGroups = food.option_groups ?? []
  const menuPrice = food.menu_price ?? food.display_price ?? food.price

  const [quantity, setQuantity] = useState(1)
  const [groupSelections, setGroupSelections] = useState<GroupSelections>(() =>
    buildDefaultSelections(optionGroups)
  )
  const [selectionValid, setSelectionValid] = useState(() =>
    isGroupSelectionValid(optionGroups, buildDefaultSelections(optionGroups))
  )
  const [addedToCart, setAddedToCart] = useState(false)
  const { addToCart, itemCount, storeLocation } = useCart()
  const { foods: foodAvailabilityMaps, sides: sideAvailabilityMaps } = useAvailability()
  const { applyBranchAvailability } = useBranchAvailability()

  const foodUi = effectiveFoodMenuUiStatus(
    food,
    applyBranchAvailability,
    storeLocation,
    foodAvailabilityMaps
  )
  const getSideUiStatus = useMemo(
    () => (sideId: number) =>
      effectiveSideMenuUiStatus(sideId, applyBranchAvailability, storeLocation, sideAvailabilityMaps),
    [applyBranchAvailability, storeLocation, sideAvailabilityMaps]
  )

  const cartSides = useMemo(
    () => selectionsToCartSides(optionGroups, groupSelections),
    [optionGroups, groupSelections]
  )

  const deltasTotal = useMemo(() => calculateSelectionDeltasTotal(cartSides), [cartSides])
  const unitTotal = calculateUnitTotal(menuPrice, cartSides)
  const itemTotal = unitTotal * quantity

  const handleSelectionChange = useCallback((selected: GroupSelections, isValid: boolean) => {
    setGroupSelections(selected)
    setSelectionValid(isValid)
  }, [])

  const incrementQuantity = () => setQuantity((q) => Math.min(q + 1, 10))
  const decrementQuantity = () => setQuantity((q) => Math.max(q - 1, 1))

  useEffect(() => {
    if (document.body.style.pointerEvents === "none") {
      document.body.style.pointerEvents = "auto"
    }
  }, [])

  const handleAddToCart = () => {
    if (!selectionValid) return
    if (foodUi !== "available") return

    addToCart({
      foodId: food.id,
      foodName: food.name,
      foodPrice: menuPrice,
      foodImage: food.image_url,
      quantity,
      sides: cartSides,
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const hasOptions = optionGroups.length > 0

  return (
    <div className="mt-8 pt-6 border-t border-border space-y-6">
      {hasOptions && (
        <OptionGroupsSelector
          optionGroups={optionGroups}
          onSelectionChange={handleSelectionChange}
          getSideUiStatus={getSideUiStatus}
        />
      )}

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground">Quantity</span>
        <div className="flex items-center gap-3 bg-muted rounded-full p-1">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="h-8 w-8 rounded-full flex items-center justify-center bg-card text-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-semibold text-foreground">{quantity}</span>
          <button
            onClick={incrementQuantity}
            disabled={quantity >= 10}
            className="h-8 w-8 rounded-full flex items-center justify-center bg-card text-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {hasOptions && cartSides.length > 0 && (
        <div className="rounded-xl bg-muted/50 p-4 space-y-2 text-sm">
          {cartSides.map((side) => {
            const delta = side.price_delta ?? 0
            const label =
              side.quantity > 1 && delta !== 0
                ? `${delta > 0 ? "+ " : "- "}₦${formatPrice(Math.abs(delta * side.quantity))}`
                : formatOptionPriceLabel(delta)

            return (
              <div key={`${side.group_id}-${side.id}`} className="flex justify-between text-muted-foreground">
                <span>
                  {side.name} {side.quantity > 1 && `× ${side.quantity}`}
                </span>
                <span>{label}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={
            !food.is_available || foodUi !== "available" || !selectionValid || addedToCart
          }
          size="lg"
          className={`flex-1 h-12 text-base font-semibold transition-all ${
            addedToCart ? "bg-green-600 hover:bg-green-600" : ""
          }`}
        >
          {addedToCart ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Added to cart!
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add ₦{formatPrice(itemTotal)}
            </>
          )}
        </Button>
        {itemCount > 0 && (
          <Button asChild variant="outline" size="lg" className="h-12">
            <Link href="/cart">View Cart ({itemCount})</Link>
          </Button>
        )}
      </div>

      {addedToCart && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
          <Check className="h-4 w-4 shrink-0" />
          <span>
            {quantity} × {food.name} added to your cart.{" "}
            <Link href="/cart" className="font-medium underline hover:no-underline">
              View cart
            </Link>
          </span>
        </div>
      )}

      {!food.is_available && (
        <p className="text-sm text-destructive">
          This item is currently unavailable. Please check back later.
        </p>
      )}

      {food.is_available && foodUi === "hidden" && (
        <p className="text-sm text-destructive">
          This item is not served at your selected branch. Choose another address or browse the menu.
        </p>
      )}

      {food.is_available && foodUi === "out_of_stock" && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Out of stock at this branch right now. You can still browse other dishes.
        </p>
      )}

      {food.is_available && foodUi === "available" && hasOptions && !selectionValid && (
        <p className="text-sm text-destructive">
          Please complete all required options before adding to cart.
        </p>
      )}
    </div>
  )
}
