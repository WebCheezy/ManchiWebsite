"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  AlertCircle,
  ShoppingCart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useCart } from "@/lib/cart"
import { formatPrice } from "@/lib/format"
import type { CartItem } from "@/lib/db/types"

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200&h=200&fit=crop&q=80"
const VAT_RATE = 0.075 // 7.5% VAT

interface CartContentProps {
  userId: string | null
  profileIncomplete: boolean
  hasAddress: boolean
  defaultTransportFeeNaira: number
  defaultAddressLga: string | null
  defaultAddressState: string | null
}

export function CartContent({
  userId,
  profileIncomplete,
  hasAddress,
  defaultTransportFeeNaira,
  defaultAddressLga,
  defaultAddressState,
}: CartContentProps) {
  const { cart, itemCount, subtotal, removeFromCart, updateQuantity, clearCart, getItemTotal, deliveryMethod } = useCart()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [transportFee, setTransportFee] = useState(defaultTransportFeeNaira)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (deliveryMethod === "pickup") {
      setTransportFee(0)
      return
    }
    if (!hasAddress || !defaultAddressLga || !defaultAddressState) {
      setTransportFee(defaultTransportFeeNaira)
      return
    }
    setTransportFee(defaultTransportFeeNaira)
    let cancelled = false
    const qs = new URLSearchParams({ lga: defaultAddressLga, state: defaultAddressState })
    fetch(`/api/transport-price?${qs}`)
      .then((r) => r.json())
      .then((d: { price?: number }) => {
        if (!cancelled && typeof d.price === "number") setTransportFee(d.price)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [
    mounted,
    deliveryMethod,
    hasAddress,
    defaultAddressLga,
    defaultAddressState,
    defaultTransportFeeNaira,
  ])

  if (!mounted) {
    return <CartSkeleton />
  }

  if (cart.items.length === 0) {
    return <EmptyCart />
  }

  const isPickup = deliveryMethod === "pickup"
  const deliveryFee = isPickup ? 0 : transportFee
  const vat = Math.round(subtotal * VAT_RATE)
  const total = subtotal + vat + deliveryFee

  const canCheckout = userId && !profileIncomplete && (isPickup || hasAddress)

  const handleCheckout = () => {
    if (!userId) {
      router.push("/login?redirect=/cart")
      return
    }
    if (profileIncomplete) {
      router.push("/account?message=phone-required")
      return
    }
    if (!isPickup && !hasAddress) {
      router.push("/account/addresses")
      return
    }
    router.push("/checkout")
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {cart.items.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
            onRemove={() => removeFromCart(item.id)}
            getItemTotal={getItemTotal}
          />
        ))}

        {/* Clear Cart */}
        <div className="flex justify-end pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear cart
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {itemCount} item{itemCount !== 1 ? "s" : ""} from your cart.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={clearCart}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear cart
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
              <span>₦{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VAT (7.5%)</span>
              <span>₦{formatPrice(vat)}</span>
            </div>
            {!isPickup && (
              <div className="flex justify-between text-muted-foreground">
                <span>Transport fee</span>
                <span>₦{formatPrice(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-foreground text-base pt-3 border-t border-border">
              <span>Total</span>
              <span>₦{formatPrice(total)}</span>
            </div>
          </div>

          {/* Warnings */}
          {!userId && (
            <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                Please{" "}
                <Link href="/login?redirect=/cart" className="text-primary font-medium hover:underline">
                  sign in
                </Link>{" "}
                to proceed to checkout.
              </p>
            </div>
          )}

          {userId && profileIncomplete && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-destructive">
                Please{" "}
                <Link href="/account" className="font-medium hover:underline">
                  add your phone number
                </Link>{" "}
                to place an order.
              </p>
            </div>
          )}

          {userId && !profileIncomplete && !isPickup && !hasAddress && (
            <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                Please{" "}
                <Link href="/account/addresses" className="text-primary font-medium hover:underline">
                  add a delivery address
                </Link>{" "}
                to continue.
              </p>
            </div>
          )}

          <Button
            onClick={handleCheckout}
            size="lg"
            className="w-full h-12 text-base font-semibold"
          >
            {!userId
              ? "Sign in to checkout"
              : canCheckout
                ? "Proceed to checkout"
                : profileIncomplete
                  ? "Complete profile"
                  : "Add delivery address"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure checkout powered by Paystack
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Cart Item Card ─────────────────────────────────────────────────────────
interface CartItemCardProps {
  item: CartItem
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
  getItemTotal: (item: CartItem) => number
}

function CartItemCard({ item, onUpdateQuantity, onRemove, getItemTotal }: CartItemCardProps) {
  const itemTotal = getItemTotal(item)

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4">
      {/* Image */}
      <Link href={`/menu/${item.foodId}`} className="shrink-0">
        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg overflow-hidden bg-muted">
          <img
            src={item.foodImage || PLACEHOLDER_IMAGE}
            alt={item.foodName}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/menu/${item.foodId}`}
              className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
            >
              {item.foodName}
            </Link>
            <p className="text-sm text-muted-foreground">₦{formatPrice(item.foodPrice)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Sides */}
        {item.sides.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.sides.map((side) => (
              <span
                key={side.id}
                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {side.name}
                {side.quantity > 1 && ` ×${side.quantity}`}
                {side.price > 0 && ` (+₦${formatPrice(side.price * side.quantity)})`}
              </span>
            ))}
          </div>
        )}

        {/* Quantity & Total */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              disabled={item.quantity >= 20}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <span className="font-semibold text-foreground">₦{formatPrice(itemTotal)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Empty Cart ─────────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Looks like you haven't added anything to your cart yet. Start browsing our delicious menu!
      </p>
      <Button asChild size="lg">
        <Link href="/menu">
          <ShoppingBag className="mr-2 h-5 w-5" />
          Browse menu
        </Link>
      </Button>
    </div>
  )
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
function CartSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="lg:col-span-1">
        <div className="h-80 rounded-2xl bg-muted animate-pulse" />
      </div>
    </div>
  )
}
