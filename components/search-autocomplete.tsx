"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, X, Loader2 } from "lucide-react"
import type { FoodWithCategory } from "@/lib/db/types"
import { formatPrice } from "@/lib/format"
import { useCart } from "@/lib/cart/cart-context"
import { useAvailability } from "@/lib/availability/availability-context"
import { effectiveFoodMenuUiStatus } from "@/lib/availability/status"
import { useBranchAvailability } from "@/lib/browse/branch-availability-context"

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=100&h=100&fit=crop&q=80"

interface SearchAutocompleteProps {
  foods: FoodWithCategory[]
  placeholder?: string
  className?: string
  inputClassName?: string
  variant?: "default" | "hero"
}

export function SearchAutocomplete({
  foods,
  placeholder = "Search for dishes...",
  className = "",
  inputClassName = "",
  variant = "default",
}: SearchAutocompleteProps) {
  const { storeLocation } = useCart()
  const { foods: foodAvailabilityMaps } = useAvailability()
  const { applyBranchAvailability } = useBranchAvailability()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const results = useMemo(() => {
    if (query.trim().length < 2) return []

    const filtered = foods
      .map((food, index) => ({ food, index }))
      .filter(
        ({ food }) =>
          effectiveFoodMenuUiStatus(food, applyBranchAvailability, storeLocation, foodAvailabilityMaps) !==
          "hidden"
      )
      .filter(
        ({ food }) =>
          food.name.toLowerCase().includes(query.toLowerCase()) ||
          food.description?.toLowerCase().includes(query.toLowerCase())
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

    return filtered.map(({ food }) => food).slice(0, 6)
  }, [foods, query, applyBranchAvailability, storeLocation, foodAvailabilityMaps])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(value.trim().length >= 2)
    setHighlightedIndex(-1)
  }

  const handleClear = () => {
    setQuery("")
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleSelect = (food: FoodWithCategory) => {
    setQuery("")
    setIsOpen(false)
    router.push(`/menu/${food.id}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (highlightedIndex >= 0 && results[highlightedIndex]) {
      handleSelect(results[highlightedIndex])
    } else if (query.trim()) {
      setIsOpen(false)
      router.push(`/menu?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
        break
      case "Escape":
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const baseInputStyles = variant === "hero"
    ? "h-12 sm:h-14 w-full rounded-full border-2 border-primary-foreground/20 bg-card pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent shadow-lg"
    : "h-10 w-full rounded-full border border-border bg-card pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground ${
              variant === "hero" ? "left-4 h-5 w-5" : "left-3 h-4 w-4"
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
            placeholder={placeholder}
            className={`${baseInputStyles} ${inputClassName}`}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls="search-results"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${
                variant === "hero" ? "right-4" : "right-3"
              }`}
            >
              <X className={variant === "hero" ? "h-5 w-5" : "h-4 w-4"} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown Results */}
      {isOpen && (
        <div
          ref={dropdownRef}
          id="search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
        >
          {results.length > 0 ? (
            <>
              <ul className="max-h-[320px] overflow-y-auto">
                {results.map((food, index) => (
                  <li key={food.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(food)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                        index === highlightedIndex
                          ? "bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                      role="option"
                      aria-selected={index === highlightedIndex}
                    >
                      <img
                        src={food.image_url || PLACEHOLDER_IMAGE}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-muted shrink-0"
                        crossOrigin="anonymous"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {food.name}
                        </p>
                        {food.category && (
                          <p className="text-xs text-muted-foreground truncate">
                            {food.category.name}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-foreground shrink-0">
                        ₦{formatPrice(food.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border p-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    router.push(`/menu?q=${encodeURIComponent(query.trim())}`)
                  }}
                  className="w-full text-center text-sm text-primary font-medium py-2 hover:bg-muted rounded-lg transition-colors"
                >
                  See all results for &quot;{query}&quot;
                </button>
              </div>
            </>
          ) : query.trim().length >= 2 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No dishes found for &quot;{query}&quot;
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  router.push(`/menu?q=${encodeURIComponent(query.trim())}`)
                }}
                className="mt-2 text-sm text-primary font-medium hover:underline"
              >
                Search all menu items
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
