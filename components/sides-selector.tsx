"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, Plus, Minus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SideForFood } from "@/lib/db/types"
import { formatPrice } from "@/lib/format"
import type { SideMenuUiStatus } from "@/lib/availability/status"

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=100&h=100&fit=crop&q=80"

export interface SelectedSide {
  side: SideForFood
  quantity: number
}

interface SidesSelectorProps {
  sides: {
    required: SideForFood[]
    optional: SideForFood[]
  }
  onSelectionChange?: (selection: SelectedSide[]) => void
  className?: string
  /** Per-side status at the active branch (hidden sides are omitted). */
  getSideUiStatus?: (sideId: number) => SideMenuUiStatus
}

export function SidesSelector({ sides, onSelectionChange, className = "", getSideUiStatus }: SidesSelectorProps) {
  const [selectedRequired, setSelectedRequired] = useState<SideForFood | null>(null)
  const [selectedOptional, setSelectedOptional] = useState<Map<number, number>>(new Map())

  const statusOf = getSideUiStatus ?? (() => "available" as SideMenuUiStatus)

  const requiredVisible = sides.required.filter((s) => statusOf(s.id) !== "hidden")
  const optionalVisible = sides.optional.filter((s) => statusOf(s.id) !== "hidden")

  const hasRequired = requiredVisible.length > 0
  const hasOptional = optionalVisible.length > 0
  const hasSides = hasRequired || hasOptional

  const getSelection = useCallback((): SelectedSide[] => {
    const selection: SelectedSide[] = []
    
    if (selectedRequired) {
      selection.push({ side: selectedRequired, quantity: 1 })
    }

    selectedOptional.forEach((quantity, sideId) => {
      const side = optionalVisible.find((s) => s.id === sideId)
      if (side && quantity > 0) {
        selection.push({ side, quantity })
      }
    })
    
    return selection
  }, [selectedRequired, selectedOptional, optionalVisible])

  useEffect(() => {
    onSelectionChange?.(getSelection())
  }, [getSelection, onSelectionChange])

  const handleRequiredSelect = (side: SideForFood) => {
    setSelectedRequired(side)
  }

  const handleOptionalToggle = (side: SideForFood) => {
    setSelectedOptional((prev) => {
      const next = new Map(prev)
      if (next.has(side.id)) {
        next.delete(side.id)
      } else {
        next.set(side.id, 1)
      }
      return next
    })
  }

  const handleOptionalQuantity = (side: SideForFood, delta: number) => {
    setSelectedOptional((prev) => {
      const next = new Map(prev)
      const current = next.get(side.id) || 0
      const newQty = Math.max(0, Math.min(5, current + delta))
      
      if (newQty === 0) {
        next.delete(side.id)
      } else {
        next.set(side.id, newQty)
      }
      
      return next
    })
  }

  const isRequiredValid = !hasRequired || selectedRequired !== null

  if (!hasSides) {
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Required Sides */}
      {hasRequired && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Choose your side</h3>
            <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
              Required
            </span>
          </div>
          
          {!isRequiredValid && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>Please select a side to continue</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {requiredVisible.map((side) => {
              const isSelected = selectedRequired?.id === side.id
              const st = statusOf(side.id)
              const disabled = st === "out_of_stock"
              return (
                <button
                  key={side.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && handleRequiredSelect(side)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    disabled
                      ? "border-border/60 bg-muted/40 opacity-80 cursor-not-allowed"
                      : isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img
                      src={side.image_url || PLACEHOLDER_IMAGE}
                      alt={side.name}
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{side.name}</p>
                    {disabled && (
                      <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Out of stock</p>
                    )}
                    {side.type && (
                      <p className="text-xs text-muted-foreground capitalize">{side.type}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold text-foreground">
                      {side.price > 0 ? `+₦${formatPrice(side.price)}` : "Free"}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Optional Sides */}
      {hasOptional && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Add extras</h3>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Optional
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {optionalVisible.map((side) => {
              const quantity = selectedOptional.get(side.id) || 0
              const isSelected = quantity > 0
              const st = statusOf(side.id)
              const disabled = st === "out_of_stock"
              return (
                <div
                  key={side.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    disabled
                      ? "border-border/60 bg-muted/40 opacity-80"
                      : isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                  }`}
                >
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    <img
                      src={side.image_url || PLACEHOLDER_IMAGE}
                      alt={side.name}
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{side.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {side.price > 0 ? `+₦${formatPrice(side.price)}` : "Free"}
                      {side.type && ` · ${side.type}`}
                    </p>
                    {disabled && (
                      <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-0.5">
                        Out of stock
                      </p>
                    )}
                  </div>

                  {disabled ? (
                    <span className="text-[11px] font-medium text-muted-foreground shrink-0">—</span>
                  ) : isSelected ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => handleOptionalQuantity(side, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium text-foreground">
                        {quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => handleOptionalQuantity(side, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-8 px-3 rounded-full"
                      onClick={() => handleOptionalToggle(side)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Calculate the total price of selected sides
 */
export function calculateSidesTotal(selection: SelectedSide[]): number {
  return selection.reduce((total, { side, quantity }) => {
    return total + side.price * quantity
  }, 0)
}

/**
 * Check if required sides are selected
 */
export function isRequiredSideSelected(
  sides: { required: SideForFood[] },
  selection: SelectedSide[]
): boolean {
  if (sides.required.length === 0) return true
  return selection.some((s) => s.side.is_required)
}
