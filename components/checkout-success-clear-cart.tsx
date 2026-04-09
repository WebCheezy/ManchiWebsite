"use client"

import { useEffect } from "react"
import { useCart, CART_STORAGE_KEY } from "@/lib/cart"
import type { Cart } from "@/lib/db/types"

/**
 * Clears the browser cart only after Paystack return + server verification succeeded.
 *
 * CartProvider loads from localStorage in a parent useEffect. If we clear in the same tick,
 * that effect can run after the child and restore the cart. We therefore:
 * 1) defer with setTimeout(0) so we run after CartProvider's hydration load effect,
 * 2) write an empty cart to localStorage first (source of truth for the next load),
 * 3) dispatch CLEAR_CART.
 */
export function CheckoutSuccessClearCart({ paymentReference }: { paymentReference: string }) {
  const { clearCart } = useCart()

  useEffect(() => {
    if (typeof window === "undefined" || !paymentReference) return

    const key = `manchi_cart_cleared_${paymentReference}`
    const empty: Cart = {
      items: [],
      updatedAt: new Date().toISOString(),
    }

    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(empty))
      } catch {
        /* ignore */
      }
      clearCart()
      try {
        sessionStorage.setItem(key, "1")
      } catch {
        /* ignore */
      }
    }, 0)

    return () => window.clearTimeout(id)
  }, [clearCart, paymentReference])

  return null
}
