"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ShoppingBag, Plus, Minus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FoodWithCategory } from "@/lib/db/types"
import { formatPrice } from "@/lib/format"
import { useCart } from "@/lib/cart/cart-context"
import { useAvailability } from "@/lib/availability/availability-context"
import { effectiveFoodMenuUiStatus } from "@/lib/availability/status"
import { useBranchAvailability } from "@/lib/browse/branch-availability-context"

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=260&fit=crop&q=80"

interface PopularDishesProps {
  foods: FoodWithCategory[]
  title?: string
  subtitle?: string
}

export function PopularDishes({ foods, title = "Popular dishes", subtitle = "Crowd favourites that our customers order again and again." }: PopularDishesProps) {
  const { cart, addToCart, updateQuantity, removeFromCart, storeLocation } = useCart()
  const { foods: foodAvailabilityMaps } = useAvailability()
  const { applyBranchAvailability } = useBranchAvailability()
  const visible = useMemo(() => {
    const filtered = foods
      .map((food, index) => ({ food, index }))
      .filter(
        ({ food }) =>
          effectiveFoodMenuUiStatus(food, applyBranchAvailability, storeLocation, foodAvailabilityMaps) !== "hidden"
      )

    filtered.sort((a, b) => {
      const aOutOfStock =
        effectiveFoodMenuUiStatus(a.food, applyBranchAvailability, storeLocation, foodAvailabilityMaps) ===
        "out_of_stock"
      const bOutOfStock =
        effectiveFoodMenuUiStatus(b.food, applyBranchAvailability, storeLocation, foodAvailabilityMaps) ===
        "out_of_stock"
      if (aOutOfStock === bOutOfStock) return a.index - b.index
      return aOutOfStock ? 1 : -1
    })

    return filtered.map(({ food }) => food)
  }, [foods, applyBranchAvailability, storeLocation, foodAvailabilityMaps])

  const getCartInfoForFood = (foodId: number) => {
    const cartItems = cart.items.filter((item) => item.foodId === foodId)
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const firstItem = cartItems[0]
    return { totalQuantity, firstItem, cartItems }
  }

  const handleAddToCart = (e: React.MouseEvent, food: FoodWithCategory) => {
    e.preventDefault()
    e.stopPropagation()
    if (
      effectiveFoodMenuUiStatus(food, applyBranchAvailability, storeLocation, foodAvailabilityMaps) ===
      "out_of_stock"
    )
      return
    addToCart({
      foodId: food.id,
      foodName: food.name,
      foodPrice: food.price,
      foodImage: food.image_url,
      quantity: 1,
      sides: [],
    })
  }

  const handleIncrease = (e: React.MouseEvent, food: FoodWithCategory) => {
    e.preventDefault()
    e.stopPropagation()
    const { firstItem } = getCartInfoForFood(food.id)
    if (firstItem) {
      updateQuantity(firstItem.id, firstItem.quantity + 1)
    } else {
      handleAddToCart(e, food)
    }
  }

  const handleDecrease = (e: React.MouseEvent, food: FoodWithCategory) => {
    e.preventDefault()
    e.stopPropagation()
    const { firstItem } = getCartInfoForFood(food.id)
    if (firstItem) {
      if (firstItem.quantity <= 1) {
        removeFromCart(firstItem.id)
      } else {
        updateQuantity(firstItem.id, firstItem.quantity - 1)
      }
    }
  }

  const handleRemove = (e: React.MouseEvent, food: FoodWithCategory) => {
    e.preventDefault()
    e.stopPropagation()
    const { cartItems } = getCartInfoForFood(food.id)
    cartItems.forEach((item) => removeFromCart(item.id))
  }

  return (
    <section id="popular" className="pb-4">
      <div className="rounded-2xl border border-border bg-card px-3 py-5 sm:px-4 sm:py-6 lg:px-5">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Link href="/menu" className="hidden text-sm text-primary font-medium hover:underline sm:inline-block">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {visible.map((food) => {
            const ui = effectiveFoodMenuUiStatus(
              food,
              applyBranchAvailability,
              storeLocation,
              foodAvailabilityMaps
            )
            const outOfStock = ui === "out_of_stock"
            const { totalQuantity } = getCartInfoForFood(food.id)
            const inCart = totalQuantity > 0
            return (
              <Link
                key={food.id}
                href={`/menu/${food.id}`}
                className="bg-background rounded-2xl overflow-hidden border border-border/80 hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <div className="relative h-40 sm:h-44 overflow-hidden bg-muted">
                  <img
                    src={food.image_url || PLACEHOLDER_IMAGE}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    crossOrigin="anonymous"
                  />
                  {food.category && (
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      {food.category.name}
                    </span>
                  )}
                  {/* Cart quantity flag */}
                  {outOfStock && (
                    <span className="absolute top-3 right-3 bg-amber-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">
                      Out of stock
                    </span>
                  )}
                  {inCart && !outOfStock && (
                    <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold min-w-[22px] h-[22px] rounded-full flex items-center justify-center shadow">
                      {totalQuantity}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2">{food.name}</h3>
                  {food.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{food.description}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-base sm:text-lg font-semibold text-foreground">
                      &#8358;{formatPrice(food.price)}
                    </span>
                    {outOfStock ? (
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Unavailable here</span>
                      ) : inCart ? (
                        <div className="flex items-center gap-0.5" onClick={(e) => e.preventDefault()}>
                        {totalQuantity === 1 ? (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 rounded-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            aria-label={`Remove ${food.name} from cart`}
                            onClick={(e) => handleRemove(e, food)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-9 w-9 rounded-full"
                            aria-label={`Decrease ${food.name} quantity`}
                            onClick={(e) => handleDecrease(e, food)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                        <span className="w-8 text-center text-sm font-semibold">{totalQuantity}</span>
                        <Button
                          size="icon"
                          className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                          aria-label={`Increase ${food.name} quantity`}
                          onClick={(e) => handleIncrease(e, food)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="h-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 px-3"
                        aria-label={`Order ${food.name}`}
                        onClick={(e) => handleAddToCart(e, food)}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Order
                      </Button>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
