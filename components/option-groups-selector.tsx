"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Plus, Minus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { OptionGroup } from "@/lib/db/types"
import { formatOptionPriceLabel } from "@/lib/pricing"
import type { SideMenuUiStatus } from "@/lib/availability/status"

export type GroupSelections = Map<number, Map<number, number>>

interface OptionGroupsSelectorProps {
  optionGroups: OptionGroup[]
  onSelectionChange?: (selected: GroupSelections, isValid: boolean) => void
  className?: string
  getSideUiStatus?: (sideId: number) => SideMenuUiStatus
}

function buildDefaultSelections(optionGroups: OptionGroup[]): GroupSelections {
  const map: GroupSelections = new Map()
  for (const group of optionGroups) {
    const defaultSide = group.sides.find((s) => s.is_pricing_default)
    if (!defaultSide) continue
    if (group.max_selections === 1 || group.is_required) {
      map.set(group.id, new Map([[defaultSide.id, 1]]))
    }
  }
  return map
}

function countSelections(groupSel: Map<number, number> | undefined): number {
  if (!groupSel) return 0
  return Array.from(groupSel.values()).reduce((sum, q) => sum + q, 0)
}

function isSelectionValid(optionGroups: OptionGroup[], selected: GroupSelections): boolean {
  for (const group of optionGroups) {
    const count = countSelections(selected.get(group.id))
    if (group.is_required && count < Math.max(1, group.min_selections)) return false
    if (count < group.min_selections) return false
    if (count > group.max_selections) return false
  }
  return true
}

function selectionHint(group: OptionGroup): string {
  if (group.min_selections === group.max_selections) {
    return group.max_selections === 1 ? "SELECT 1" : `SELECT ${group.max_selections}`
  }
  if (group.min_selections > 0) {
    return `SELECT ${group.min_selections}–${group.max_selections}`
  }
  return `UP TO ${group.max_selections}`
}

export function OptionGroupsSelector({
  optionGroups,
  onSelectionChange,
  className = "",
  getSideUiStatus,
}: OptionGroupsSelectorProps) {
  const [selected, setSelected] = useState<GroupSelections>(() => buildDefaultSelections(optionGroups))

  const statusOf = getSideUiStatus ?? (() => "available" as SideMenuUiStatus)

  const visibleGroups = useMemo(
    () =>
      optionGroups
        .map((group) => ({
          ...group,
          sides: group.sides.filter((s) => statusOf(s.id) !== "hidden"),
        }))
        .filter((g) => g.sides.length > 0),
    [optionGroups, statusOf]
  )

  const valid = useMemo(() => isSelectionValid(visibleGroups, selected), [visibleGroups, selected])

  useEffect(() => {
    onSelectionChange?.(selected, valid)
  }, [selected, valid, onSelectionChange])

  const setGroupSelection = useCallback((groupId: number, sideId: number, quantity: number) => {
    setSelected((prev) => {
      const next = new Map(prev)
      const group = optionGroups.find((g) => g.id === groupId)
      if (!group) return prev

      if (group.max_selections === 1) {
        next.set(groupId, quantity > 0 ? new Map([[sideId, 1]]) : new Map())
        return next
      }

      const groupMap = new Map(next.get(groupId) ?? [])
      if (quantity <= 0) {
        groupMap.delete(sideId)
      } else {
        const otherCount = Array.from(groupMap.entries())
          .filter(([id]) => id !== sideId)
          .reduce((sum, [, q]) => sum + q, 0)
        const maxForThis = Math.min(quantity, Math.max(0, group.max_selections - otherCount))
        if (maxForThis > 0) {
          groupMap.set(sideId, maxForThis)
        } else {
          groupMap.delete(sideId)
        }
      }

      if (groupMap.size === 0) {
        next.delete(groupId)
      } else {
        next.set(groupId, groupMap)
      }
      return next
    })
  }, [optionGroups])

  const getSideQuantity = (groupId: number, sideId: number): number =>
    selected.get(groupId)?.get(sideId) ?? 0

  if (visibleGroups.length === 0) return null

  return (
    <div className={`space-y-5 ${className}`}>
      {visibleGroups.map((group) => {
        const groupCount = countSelections(selected.get(group.id))
        const groupValid =
          !group.is_required || groupCount >= Math.max(1, group.min_selections)
        const isSingleSelect = group.max_selections === 1

        return (
          <div key={group.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{group.name}</h3>
                {group.is_required && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-destructive border border-destructive/40 rounded px-1.5 py-0.5">
                    Required
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 tracking-wide">
                {selectionHint(group)}
              </p>
            </div>

            {!groupValid && (
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-destructive bg-destructive/5 border-b border-border">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Please select from {group.name}</span>
              </div>
            )}

            <div className="divide-y divide-border">
              {group.sides.map((side) => {
                const qty = getSideQuantity(group.id, side.id)
                const isSelected = qty > 0
                const st = statusOf(side.id)
                const disabled = st === "out_of_stock"

                return (
                  <div
                    key={side.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      isSelected ? "bg-primary/5" : ""
                    } ${disabled ? "opacity-60" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{side.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatOptionPriceLabel(side.price_delta)}
                      </p>
                      {disabled && (
                        <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-0.5">
                          Out of stock
                        </p>
                      )}
                    </div>

                    {disabled ? (
                      <span className="text-xs text-muted-foreground shrink-0">—</span>
                    ) : isSingleSelect ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={`h-9 w-9 rounded-full shrink-0 ${
                          isSelected ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90" : ""
                        }`}
                        onClick={() => setGroupSelection(group.id, side.id, isSelected ? 0 : 1)}
                        aria-label={isSelected ? `Deselect ${side.name}` : `Select ${side.name}`}
                      >
                        {isSelected ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    ) : isSelected ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => setGroupSelection(group.id, side.id, qty - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-5 text-center text-sm font-medium">{qty}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => setGroupSelection(group.id, side.id, qty + 1)}
                          disabled={groupCount >= group.max_selections}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full shrink-0"
                        onClick={() => setGroupSelection(group.id, side.id, 1)}
                        disabled={groupCount >= group.max_selections}
                        aria-label={`Add ${side.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** @deprecated Use calculateSelectionDeltasTotal from lib/pricing */
export function calculateSidesTotal(
  selection: Array<{ side: { price_delta?: number; price: number }; quantity: number }>
): number {
  return selection.reduce((total, { side, quantity }) => {
    const delta = side.price_delta ?? side.price
    return total + delta * quantity
  }, 0)
}
