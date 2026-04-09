"use client"

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
} from "react"
import type { Cart, CartItem, CartSideItem } from "@/lib/db/types"
import type { DeliveryMethod, StoreLocation } from "@/lib/db/types"

/** Exported so checkout success can clear storage in sync with context (avoids load-after-clear races). */
export const CART_STORAGE_KEY = "manchi-cart"
const DELIVERY_METHOD_STORAGE_KEY = "manchi-delivery-method"
const STORE_LOCATION_STORAGE_KEY = "manchi-store-location"

// ─── Types ──────────────────────────────────────────────────────────────────
interface AddToCartPayload {
  foodId: number
  foodName: string
  foodPrice: number
  foodImage: string | null
  quantity: number
  sides: CartSideItem[]
}

type CartAction =
  | { type: "LOAD_CART"; cart: Cart }
  | { type: "ADD_ITEM"; payload: AddToCartPayload }
  | { type: "REMOVE_ITEM"; itemId: string }
  | { type: "UPDATE_QUANTITY"; itemId: string; quantity: number }
  | { type: "CLEAR_CART" }

interface CartContextValue {
  cart: Cart
  itemCount: number
  subtotal: number
  deliveryMethod: DeliveryMethod
  setDeliveryMethod: (method: DeliveryMethod) => void
  storeLocation: StoreLocation
  setStoreLocation: (location: StoreLocation) => void
  addToCart: (payload: AddToCartPayload) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getItemTotal: (item: CartItem) => number
}

// ─── Initial State ──────────────────────────────────────────────────────────
const initialCart: Cart = {
  items: [],
  updatedAt: new Date().toISOString(),
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function generateItemId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function calculateItemTotal(item: CartItem): number {
  const sidesTotal = item.sides.reduce(
    (sum, side) => sum + side.price * side.quantity,
    0
  )
  return (item.foodPrice + sidesTotal) * item.quantity
}

function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
}

function calculateItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

// ─── Reducer ────────────────────────────────────────────────────────────────
function cartReducer(state: Cart, action: CartAction): Cart {
  const now = new Date().toISOString()

  switch (action.type) {
    case "LOAD_CART":
      return action.cart

    case "ADD_ITEM": {
      const { foodId, foodName, foodPrice, foodImage, quantity, sides } = action.payload
      
      // Check if an identical item already exists (same food + same sides)
      const sidesKey = sides
        .map((s) => `${s.id}:${s.quantity}`)
        .sort()
        .join(",")
      
      const existingIndex = state.items.findIndex((item) => {
        if (item.foodId !== foodId) return false
        const itemSidesKey = item.sides
          .map((s) => `${s.id}:${s.quantity}`)
          .sort()
          .join(",")
        return itemSidesKey === sidesKey
      })

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const newItems = [...state.items]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
        }
        return { items: newItems, updatedAt: now }
      }

      // Add new item
      const newItem: CartItem = {
        id: generateItemId(),
        foodId,
        foodName,
        foodPrice,
        foodImage,
        quantity,
        sides,
        addedAt: now,
      }
      return { items: [...state.items, newItem], updatedAt: now }
    }

    case "REMOVE_ITEM":
      return {
        items: state.items.filter((item) => item.id !== action.itemId),
        updatedAt: now,
      }

    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        return {
          items: state.items.filter((item) => item.id !== action.itemId),
          updatedAt: now,
        }
      }
      return {
        items: state.items.map((item) =>
          item.id === action.itemId
            ? { ...item, quantity: Math.min(action.quantity, 20) }
            : item
        ),
        updatedAt: now,
      }
    }

    case "CLEAR_CART":
      return { items: [], updatedAt: now }

    default:
      return state
  }
}

// ─── Context ────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart)
  const [deliveryMethod, setDeliveryMethodState] = useState<DeliveryMethod>("delivery")
  const [storeLocation, setStoreLocationState] = useState<StoreLocation>("Chasemall")

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Cart
        if (parsed.items && Array.isArray(parsed.items)) {
          dispatch({ type: "LOAD_CART", cart: parsed })
        }
      }
    } catch (e) {
      console.error("[CartProvider] Failed to load cart from storage:", e)
    }
  }, [])

  // Load delivery method from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DELIVERY_METHOD_STORAGE_KEY)
      if (stored === "delivery" || stored === "pickup") {
        setDeliveryMethodState(stored)
      }
    } catch (e) {
      console.error("[CartProvider] Failed to load delivery method from storage:", e)
    }
  }, [])

  // Load store location from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORE_LOCATION_STORAGE_KEY)
      if (stored === "Chasemall" || stored === "Aurora" || stored === "Eromo") {
        setStoreLocationState(stored)
      }
    } catch (e) {
      console.error("[CartProvider] Failed to load store location from storage:", e)
    }
  }, [])

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (e) {
      console.error("[CartProvider] Failed to save cart to storage:", e)
    }
  }, [cart])

  // Save delivery method to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(DELIVERY_METHOD_STORAGE_KEY, deliveryMethod)
    } catch (e) {
      console.error("[CartProvider] Failed to save delivery method to storage:", e)
    }
  }, [deliveryMethod])

  // Save store location to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORE_LOCATION_STORAGE_KEY, storeLocation)
    } catch (e) {
      console.error("[CartProvider] Failed to save store location to storage:", e)
    }
  }, [storeLocation])

  const setDeliveryMethod = useCallback((method: DeliveryMethod) => {
    setDeliveryMethodState(method)
  }, [])

  const setStoreLocation = useCallback((location: StoreLocation) => {
    setStoreLocationState(location)
  }, [])

  const addToCart = useCallback((payload: AddToCartPayload) => {
    dispatch({ type: "ADD_ITEM", payload })
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", itemId })
  }, [])

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", itemId, quantity })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" })
  }, [])

  const getItemTotal = useCallback((item: CartItem) => {
    return calculateItemTotal(item)
  }, [])

  const value: CartContextValue = {
    cart,
    itemCount: calculateItemCount(cart.items),
    subtotal: calculateSubtotal(cart.items),
    deliveryMethod,
    setDeliveryMethod,
    storeLocation,
    setStoreLocation,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemTotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
