"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import type { SerializedFoodAvailability, SerializedSideAvailability } from "@/lib/availability/status"
import { emptySerializedFoodAvailability, emptySerializedSideAvailability } from "@/lib/availability/status"

interface AvailabilityValue {
  foods: SerializedFoodAvailability
  sides: SerializedSideAvailability
}

const AvailabilityContext = createContext<AvailabilityValue | null>(null)

export function AvailabilityProvider({
  children,
  foods,
  sides,
}: {
  children: ReactNode
  foods: SerializedFoodAvailability
  sides: SerializedSideAvailability
}) {
  const value = useMemo(() => ({ foods, sides }), [foods, sides])
  return <AvailabilityContext.Provider value={value}>{children}</AvailabilityContext.Provider>
}

export function useAvailability(): AvailabilityValue {
  const ctx = useContext(AvailabilityContext)
  if (ctx) return ctx
  return {
    foods: emptySerializedFoodAvailability(),
    sides: emptySerializedSideAvailability(),
  }
}
