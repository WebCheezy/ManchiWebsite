"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useCart } from "@/lib/cart/cart-context"

interface BranchAvailabilityContextValue {
  /** When false, menu/search ignore per-branch rows (guests & signed-in without delivery addresses). */
  applyBranchAvailability: boolean
  setApplyBranchAvailability: (value: boolean) => void
}

const BranchAvailabilityContext = createContext<BranchAvailabilityContextValue | null>(null)

export function BranchAvailabilityProvider({ children }: { children: ReactNode }) {
  const [applyBranchAvailability, setApplyBranchAvailability] = useState(false)

  const value = useMemo(
    () => ({ applyBranchAvailability, setApplyBranchAvailability }),
    [applyBranchAvailability]
  )

  return (
    <BranchAvailabilityContext.Provider value={value}>{children}</BranchAvailabilityContext.Provider>
  )
}

export function useBranchAvailability(): BranchAvailabilityContextValue {
  const ctx = useContext(BranchAvailabilityContext)
  if (!ctx) {
    throw new Error("useBranchAvailability must be used within BranchAvailabilityProvider")
  }
  return ctx
}

/**
 * Keeps branch filtering in sync with auth, saved addresses, and delivery mode.
 * - Guests: never filter by branch (full menu for browsing).
 * - Signed in + delivery + no saved addresses: full menu until they add one.
 * - Signed in + delivery + has addresses: filter by resolved branch.
 * - Signed in + pickup: filter by selected pickup branch.
 */
export function BranchAvailabilitySync({
  userId,
  addressCount,
}: {
  userId: string | null
  addressCount: number
}) {
  const { deliveryMethod } = useCart()
  const { setApplyBranchAvailability } = useBranchAvailability()

  useEffect(() => {
    let apply = false
    if (userId) {
      if (deliveryMethod === "pickup") apply = true
      else if (addressCount > 0) apply = true
    }
    setApplyBranchAvailability(apply)
  }, [userId, addressCount, deliveryMethod, setApplyBranchAvailability])

  return null
}
