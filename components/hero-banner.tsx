"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Bike, ChevronLeft, ChevronRight, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FoodWithCategory } from "@/lib/db/types"
import { useCart } from "@/lib/cart/cart-context"
import { useAvailability } from "@/lib/availability/availability-context"
import { effectiveFoodMenuUiStatus } from "@/lib/availability/status"
import { useBranchAvailability } from "@/lib/browse/branch-availability-context"

const PLACEHOLDER_IMAGE = "/placeholder-food.jpg"

interface HeroBannerProps {
  foods?: FoodWithCategory[]
}

export function HeroBanner({ foods = [] }: HeroBannerProps) {
  const { storeLocation } = useCart()
  const { foods: foodAvailabilityMaps } = useAvailability()
  const { applyBranchAvailability } = useBranchAvailability()
  // Get featured foods (ones with images, max 5) — keep available dishes first.
  const featuredFoods = useMemo(() => {
    const filtered = foods
      .map((food, index) => ({ food, index }))
      .filter(({ food }) => Boolean(food.image_url))
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

    return filtered.map(({ food }) => food).slice(0, 5)
  }, [foods, applyBranchAvailability, storeLocation, foodAvailabilityMaps])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHoveringCart, setIsHoveringCart] = useState(false)

  const { cart, addToCart, updateQuantity, removeFromCart } = useCart()

  // Get cart info for a food (used in effects and render)
  const getCartInfoForFood = useCallback((foodId: number) => {
    const cartItems = cart.items.filter((item) => item.foodId === foodId)
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const firstItem = cartItems[0]
    return { totalQuantity, firstItem, cartItems }
  }, [cart.items])

  const nextSlide = useCallback(() => {
    if (featuredFoods.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % featuredFoods.length)
  }, [featuredFoods.length])

  const prevSlide = useCallback(() => {
    if (featuredFoods.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + featuredFoods.length) % featuredFoods.length)
  }, [featuredFoods.length])

  // When a carousel dish is in cart, show that slide and stay on it
  useEffect(() => {
    if (featuredFoods.length === 0) return
    const indexWithCart = featuredFoods.findIndex((f) => getCartInfoForFood(f.id).totalQuantity > 0)
    if (indexWithCart >= 0) {
      setCurrentIndex(indexWithCart)
    }
  }, [cart.items, featuredFoods, getCartInfoForFood])

  // Auto-advance only when the current slide's dish is NOT in cart
  useEffect(() => {
    if (featuredFoods.length <= 1) return
    const current = featuredFoods[currentIndex]
    if (!current || getCartInfoForFood(current.id).totalQuantity > 0) return
    const interval = setInterval(nextSlide, 4000)
    return () => clearInterval(interval)
  }, [currentIndex, featuredFoods, nextSlide, getCartInfoForFood, cart.items])

  const currentFood = featuredFoods[currentIndex]
  const currentUi = currentFood
    ? effectiveFoodMenuUiStatus(
        currentFood,
        applyBranchAvailability,
        storeLocation,
        foodAvailabilityMaps
      )
    : "available"

  const handleAddToCart = (food: FoodWithCategory) => {
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

  const handleIncreaseQuantity = (food: FoodWithCategory) => {
    const { firstItem } = getCartInfoForFood(food.id)
    if (firstItem) {
      updateQuantity(firstItem.id, firstItem.quantity + 1)
    } else {
      handleAddToCart(food)
    }
  }

  const handleDecreaseQuantity = (food: FoodWithCategory) => {
    const { firstItem } = getCartInfoForFood(food.id)
    if (firstItem) {
      if (firstItem.quantity <= 1) {
        removeFromCart(firstItem.id)
      } else {
        updateQuantity(firstItem.id, firstItem.quantity - 1)
      }
    }
  }

  const handleRemoveFromCart = (food: FoodWithCategory) => {
    const { cartItems } = getCartInfoForFood(food.id)
    // Remove all cart items for this food
    cartItems.forEach((item) => removeFromCart(item.id))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const currentFoodCartInfo = currentFood ? getCartInfoForFood(currentFood.id) : null

  return (
    <section className="relative w-full overflow-hidden rounded-2xl bg-secondary/50 dark:bg-muted/30 border border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: Column (carousel on top), Desktop: Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between min-h-[auto] sm:min-h-[380px] lg:min-h-[420px] py-6 sm:py-6 gap-6 sm:gap-8">
          
          {/* Food Slideshow Card - Shows FIRST on mobile, SECOND on desktop */}
          <div className="relative w-full sm:w-auto sm:flex-1 sm:order-2 flex justify-center sm:justify-end lg:justify-center">
            {featuredFoods.length > 0 && currentFood ? (
              <div className="relative w-full sm:max-w-[400px] md:max-w-[460px] lg:max-w-[520px] xl:max-w-[580px]">
                {/* Food Card */}
                <div className="bg-card rounded-2xl overflow-hidden shadow-xl border border-border">
                  {/* Image Container - Clickable */}
                  <Link
                    href={`/menu/${currentFood.id}`}
                    className="block relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-muted group"
                  >
                    <Image
                      src={currentFood.image_url || PLACEHOLDER_IMAGE}
                      alt={currentFood.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                    {/* Category Badge */}
                    {currentFood.category && (
                      <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        {currentFood.category.name}
                      </div>
                    )}
                    {/* Availability Badge */}
                    {!currentFood.is_available ? (
                      <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                        Unavailable
                      </div>
                    ) : currentUi === "out_of_stock" ? (
                      <div className="absolute top-3 right-3 bg-amber-600/95 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                        Out of stock
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                        Available
                      </div>
                    )}

                    {/* Cart Quantity Badge */}
                    {currentFoodCartInfo && currentFoodCartInfo.totalQuantity > 0 && (
                      <div
                        className="absolute bottom-3 right-3 z-10"
                        onMouseEnter={() => setIsHoveringCart(true)}
                        onMouseLeave={() => setIsHoveringCart(false)}
                        onClick={(e) => e.preventDefault()}
                      >
                        {!isHoveringCart ? (
                          // Simple badge showing quantity
                          <div className="bg-primary text-primary-foreground text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                            {currentFoodCartInfo.totalQuantity}
                          </div>
                        ) : (
                          // Expanded controls on hover
                          <div className="bg-card rounded-full shadow-lg border border-border flex items-center gap-1 px-1 py-1">
                            {currentFoodCartInfo.totalQuantity === 1 ? (
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 rounded-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                aria-label="Remove from cart"
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleRemoveFromCart(currentFood)
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              // Show minus when more than 1
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleDecreaseQuantity(currentFood)
                                }}
                                className="w-7 h-7 rounded-full bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <span className="w-6 text-center text-sm font-bold text-foreground">
                              {currentFoodCartInfo.totalQuantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                handleIncreaseQuantity(currentFood)
                              }}
                              className="w-7 h-7 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </Link>

                  {/* Food Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link href={`/menu/${currentFood.id}`}>
                          <h3 className="text-lg font-bold text-foreground truncate hover:text-primary transition-colors">
                            {currentFood.name}
                          </h3>
                        </Link>
                        {currentFood.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                            {currentFood.description}
                          </p>
                        )}
                        <span className="block mt-2 text-xl font-bold text-primary">
                          {formatPrice(currentFood.price)}
                        </span>
                      </div>
                      {/* Order/Add Button */}
                      {!currentFood.is_available ? (
                        <span className="text-xs font-medium text-destructive shrink-0">Unavailable</span>
                      ) : currentUi === "out_of_stock" ? (
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-400 shrink-0">
                          Out of stock
                        </span>
                      ) : currentFoodCartInfo && currentFoodCartInfo.totalQuantity > 0 ? (
                        // Show quantity controls when in cart
                        <div className="flex-shrink-0 flex items-center gap-1 bg-muted rounded-full px-1 py-1">
                          {currentFoodCartInfo.totalQuantity === 1 ? (
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-9 w-9 rounded-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              aria-label="Remove from cart"
                              onClick={() => handleRemoveFromCart(currentFood)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <button
                              onClick={() => handleDecreaseQuantity(currentFood)}
                              className="w-8 h-8 rounded-full bg-card hover:bg-card/80 text-foreground flex items-center justify-center transition-colors border border-border"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          )}
                          <span className="w-8 text-center text-sm font-bold text-foreground">
                            {currentFoodCartInfo.totalQuantity}
                          </span>
                          <button
                            onClick={() => handleIncreaseQuantity(currentFood)}
                            className="w-8 h-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(currentFood)}
                          className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-full transition-colors"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Slideshow Navigation */}
                {featuredFoods.length > 1 && (
                  <>
                    {/* Arrow Buttons */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        prevSlide()
                      }}
                      className="absolute left-2 sm:-left-4 top-[30%] sm:top-1/2 -translate-y-1/2 bg-card hover:bg-muted rounded-full p-2 shadow-lg border border-border transition-colors z-10"
                      aria-label="Previous dish"
                    >
                      <ChevronLeft className="h-4 w-4 text-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        nextSlide()
                      }}
                      className="absolute right-2 sm:-right-4 top-[30%] sm:top-1/2 -translate-y-1/2 bg-card hover:bg-muted rounded-full p-2 shadow-lg border border-border transition-colors z-10"
                      aria-label="Next dish"
                    >
                      <ChevronRight className="h-4 w-4 text-foreground" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="flex justify-center gap-2 mt-4">
                      {featuredFoods.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === currentIndex
                              ? "bg-primary w-6"
                              : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                          }`}
                          aria-label={`Go to dish ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full sm:max-w-[400px] md:max-w-[460px] lg:max-w-[520px] xl:max-w-[580px] h-[200px] sm:h-[280px] bg-muted rounded-2xl flex items-center justify-center border border-border">
                <p className="text-muted-foreground">No dishes available</p>
              </div>
            )}
          </div>

          {/* Text Content - Shows SECOND on mobile, FIRST on desktop */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left sm:order-1 sm:max-w-[42%] lg:max-w-[38%] sm:pr-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.1]">
              Start your
              <br />
              <span className="text-primary">Manchi</span> order.
            </h1>

            <div className="mt-6 sm:mt-8 flex flex-col gap-3 w-full max-w-[260px]">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm sm:text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                Order Pickup
              </Link>
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-foreground bg-transparent px-5 py-3 text-sm sm:text-base font-semibold text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                <Bike className="h-4 w-4 sm:h-5 sm:w-5" />
                Order Delivery
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
