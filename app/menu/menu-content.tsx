"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Minus, X, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Category, FoodWithCategory } from "@/lib/db/types"
import { formatPrice } from "@/lib/format"
import { useCart } from "@/lib/cart/cart-context"
import { useAvailability } from "@/lib/availability/availability-context"
import { effectiveFoodMenuUiStatus } from "@/lib/availability/status"
import { useBranchAvailability } from "@/lib/browse/branch-availability-context"

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=260&fit=crop&q=80"

interface MenuContentProps {
  categories: Category[]
  foods: FoodWithCategory[]
  selectedCategoryId: number | null
  searchQuery: string
}

export function MenuContent({
  categories,
  foods,
  selectedCategoryId,
  searchQuery,
}: MenuContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const { cart, addToCart, updateQuantity, removeFromCart, storeLocation } = useCart()
  const { foods: foodAvailabilityMaps } = useAvailability()
  const { applyBranchAvailability } = useBranchAvailability()

  const visibleFoods = useMemo(
    () =>
      foods.filter(
        (f) =>
          effectiveFoodMenuUiStatus(f, applyBranchAvailability, storeLocation, foodAvailabilityMaps) !== "hidden"
      ),
    [foods, applyBranchAvailability, storeLocation, foodAvailabilityMaps]
  )

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

  const updateFilters = (newCategory: number | null, newSearch?: string) => {
    const params = new URLSearchParams()
    if (newCategory) params.set("category", String(newCategory))
    if (newSearch ?? localSearch) params.set("q", newSearch ?? localSearch)
    
    startTransition(() => {
      router.push(`/menu${params.toString() ? `?${params.toString()}` : ""}`)
    })
  }

  const handleCategoryChange = (categoryId: number | null) => {
    const params = new URLSearchParams()
    if (categoryId) params.set("category", String(categoryId))
    if (localSearch) params.set("q", localSearch)
    
    startTransition(() => {
      router.push(`/menu${params.toString() ? `?${params.toString()}` : ""}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (selectedCategoryId) params.set("category", String(selectedCategoryId))
    if (localSearch.trim()) params.set("q", localSearch.trim())
    
    startTransition(() => {
      router.push(`/menu${params.toString() ? `?${params.toString()}` : ""}`)
    })
  }

  const clearSearch = () => {
    setLocalSearch("")
    const params = new URLSearchParams()
    if (selectedCategoryId) params.set("category", String(selectedCategoryId))
    
    startTransition(() => {
      router.push(`/menu${params.toString() ? `?${params.toString()}` : ""}`)
    })
  }

  const clearFilters = () => {
    setLocalSearch("")
    startTransition(() => {
      router.push("/menu")
    })
  }

  const hasFilters = selectedCategoryId || searchQuery

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search for dishes..."
          className="h-11 w-full rounded-full border border-border bg-card pl-11 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        />
        {localSearch && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedCategoryId
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategoryId === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filters:</span>
          {selectedCategoryId && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
              {categories.find((c) => c.id === selectedCategoryId)?.name}
              <button onClick={() => handleCategoryChange(null)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
              &quot;{searchQuery}&quot;
              <button onClick={clearSearch}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {visibleFoods.length} {visibleFoods.length === 1 ? "item" : "items"} found
      </p>

      {/* Loading Overlay */}
      <div className={`relative ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
        {/* Food Grid */}
        {visibleFoods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">No dishes found</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              {searchQuery
                ? `We couldn't find any dishes matching "${searchQuery}". Try a different search term.`
                : "No dishes available in this category right now."}
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {visibleFoods.map((food) => {
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
                  className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-md transition-all group"
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
                    <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2">
                      {food.name}
                    </h3>
                    {food.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {food.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-base sm:text-lg font-semibold text-foreground">
                        &#8358;{formatPrice(food.price)}
                      </span>
                      {outOfStock ? (
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Out of stock</span>
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
        )}
      </div>
    </div>
  )
}
