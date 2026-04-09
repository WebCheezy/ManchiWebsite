"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Clock,
  ChevronRight,
  Edit2,
  ShoppingBag,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Store,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/lib/cart"
import { formatAddressFull } from "@/lib/db/addresses"
import { formatPrice } from "@/lib/format"
import type { Address, StoreLocation } from "@/lib/db/types"
import {
  CHECKOUT_PUBLIC_EMAIL,
  CHECKOUT_PUBLIC_PHONE_DISPLAY,
  CHECKOUT_PUBLIC_PHONE_TEL,
} from "@/lib/checkout/public-contact"
import { isServedRegion, servedRegionErrorMessage } from "@/lib/delivery/served-regions"
import { getBranchDisplayInfo, resolveStoreLocationFromAddress } from "@/lib/location/branch"

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=100&h=100&fit=crop&q=80"
const VAT_RATE = 0.075

interface CheckoutContentProps {
  addresses: Address[]
  defaultAddressId: string
  /** Server-resolved fee for default address; client refetches when selection changes. */
  initialTransportFeeNaira: number
}

export function CheckoutContent({
  addresses,
  defaultAddressId,
  initialTransportFeeNaira,
}: CheckoutContentProps) {
  const { cart, itemCount, subtotal, getItemTotal, clearCart, deliveryMethod, storeLocation, setStoreLocation } = useCart()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddressId)
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [transportFee, setTransportFee] = useState(initialTransportFeeNaira)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setSelectedAddressId(defaultAddressId)
  }, [defaultAddressId])

  useEffect(() => {
    if (!mounted) return
    if (deliveryMethod !== "delivery") return
    const addr = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0]
    if (addr) setStoreLocation(resolveStoreLocationFromAddress(addr))
  }, [mounted, deliveryMethod, selectedAddressId, addresses, setStoreLocation])

  useEffect(() => {
    if (!mounted) return
    if (deliveryMethod === "pickup") {
      setTransportFee(0)
      return
    }
    const addr = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0]
    if (!addr) {
      setTransportFee(0)
      return
    }
    let cancelled = false
    const qs = new URLSearchParams({ lga: addr.lga, state: addr.state })
    fetch(`/api/transport-price?${qs}`)
      .then((r) => r.json())
      .then((d: { price?: number }) => {
        if (!cancelled && typeof d.price === "number") setTransportFee(d.price)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [mounted, deliveryMethod, selectedAddressId, addresses])

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0]

  if (!mounted) {
    return <CheckoutSkeleton />
  }

  if (cart.items.length === 0) {
    return <EmptyCart />
  }

  const isPickup = deliveryMethod === "pickup"
  const hasValidAddress = !isPickup && selectedAddress
  const addressInServedRegion =
    isPickup || !selectedAddress || isServedRegion(selectedAddress.state, selectedAddress.lga)
  const vat = Math.round(subtotal * VAT_RATE)
  const deliveryFee = isPickup ? 0 : transportFee
  const total = subtotal + vat + deliveryFee
  const canPlaceOrder = isPickup || (hasValidAddress && addressInServedRegion)

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    setPaymentError(null)

    if (!isPickup && selectedAddress && !isServedRegion(selectedAddress.state, selectedAddress.lga)) {
      setPaymentError(servedRegionErrorMessage())
      setIsProcessing(false)
      return
    }

    try {
      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/checkout/success?method=${deliveryMethod}&location=${encodeURIComponent(storeLocation)}`
          : undefined

      const res = await fetch("/api/checkout/paystack", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_items: cart.items,
          subtotal,
          vat,
          total,
          delivery_method: deliveryMethod,
          location: storeLocation,
          delivery_address: isPickup ? null : (selectedAddress ? formatAddressFull(selectedAddress) : null),
          delivery_address_id: isPickup ? null : (selectedAddress?.id ?? null),
          delivery_notes: deliveryNotes || null,
          callback_url: callbackUrl,
        }),
      })

      const data = (await res.json().catch(() => null)) as null | {
        authorization_url?: string
        error?: string
      }

      if (!res.ok || !data?.authorization_url) {
        setIsProcessing(false)
        setPaymentError(data?.error || "Payment initialization failed. Please try again.")
        return
      }

      // Cart is cleared on success page after payment (see CheckoutSuccessClearCart).
      window.location.href = data.authorization_url
    } catch {
      setIsProcessing(false)
      setPaymentError("Payment initialization failed. Please try again.")
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left: Delivery/Pickup & Payment */}
      <div className="lg:col-span-2 space-y-6">
        {/* Store location - which branch will process the order */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            {isPickup ? "Pickup location" : "Fulfillment branch"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {isPickup
              ? "Choose where you will collect your order. Menu and stock depend on this branch."
              : "Your branch is set from the delivery address below. It determines menu availability and stock."}
          </p>
          {isPickup ? (
            <RadioGroup
              value={storeLocation}
              onValueChange={(v) => setStoreLocation(v as StoreLocation)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {(["Chasemall", "Aurora", "Eromo"] as const).map((loc) => {
                const info = getBranchDisplayInfo(loc)
                return (
                  <label
                    key={loc}
                    className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                      storeLocation === loc
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={loc} className="shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground text-sm leading-tight block">{info.label}</span>
                      <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{info.subtitle}</p>
                    </div>
                  </label>
                )
              })}
            </RadioGroup>
          ) : selectedAddress ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3">
              <Store className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Preparing from</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {getBranchDisplayInfo(resolveStoreLocationFromAddress(selectedAddress)).label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  {getBranchDisplayInfo(resolveStoreLocationFromAddress(selectedAddress)).subtitle}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        {/* Delivery Address - only for delivery */}
        {!isPickup && (
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Address
              </h2>
              <Link
                href="/account/addresses"
                className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Manage
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className="flex items-start gap-2 rounded-lg bg-muted p-4 text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  Please{" "}
                  <Link href="/account/addresses" className="text-primary font-medium hover:underline">
                    add a delivery address
                  </Link>{" "}
                  to place a delivery order.
                </p>
              </div>
            ) : (
            <RadioGroup
              value={selectedAddressId}
              onValueChange={setSelectedAddressId}
              className="space-y-3"
            >
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                    selectedAddressId === address.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={address.id} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {address.title || "Address"}
                      </span>
                      {address.is_default && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatAddressFull(address)}
                    </p>
                  </div>
              </label>
            ))}
          </RadioGroup>
            )}

            {selectedAddress && !isServedRegion(selectedAddress.state, selectedAddress.lga) && (
              <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <span>{servedRegionErrorMessage()} </span>
                <Link
                  href="/account/addresses"
                  className="font-medium text-destructive underline underline-offset-2 hover:opacity-90"
                >
                  Update your address
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Pickup info - only for pickup */}
        {isPickup && (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Pickup at restaurant
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Your order will be ready for pickup at our location. We&apos;ll notify you when it&apos;s ready.
            </p>
          </section>
        )}

        {/* Contact Info — restaurant (not customer profile) */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-primary" />
            Contact Info
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <a href={`mailto:${CHECKOUT_PUBLIC_EMAIL}`} className="text-primary hover:underline">
                {CHECKOUT_PUBLIC_EMAIL}
              </a>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <a href={`tel:${CHECKOUT_PUBLIC_PHONE_TEL}`} className="text-primary hover:underline">
                {CHECKOUT_PUBLIC_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </section>

        {/* Delivery / Pickup Notes */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            {isPickup ? "Pickup notes" : "Delivery notes"}
          </h2>

          <Textarea
            placeholder={
              isPickup
                ? "Add any special requests or preferred pickup time (optional)"
                : "Add any special instructions for delivery (e.g., gate code, landmark, preferred time)"
            }
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </section>

        {/* Payment Method */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment Method
          </h2>

          <div className="flex items-center gap-3 rounded-xl border border-primary bg-primary/5 p-4">
            <div className="h-10 w-16 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">PAYSTACK</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Pay with Paystack</p>
              <p className="text-xs text-muted-foreground">
                Card, Bank Transfer, USSD, or Mobile Money
              </p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
        </section>
      </div>

      {/* Right: Order Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
            <Link href="/cart" className="text-sm text-primary font-medium hover:underline">
              Edit
            </Link>
          </div>

          {/* Items */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img
                    src={item.foodImage || PLACEHOLDER_IMAGE}
                    alt={item.foodName}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm line-clamp-1">
                    {item.quantity}× {item.foodName}
                  </p>
                  {item.sides.length > 0 && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      + {item.sides.map((s) => s.name).join(", ")}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium text-foreground shrink-0">
                  ₦{formatPrice(getItemTotal(item))}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="space-y-3 text-sm border-t border-border pt-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({itemCount} items)</span>
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
            <div className="flex justify-between font-semibold text-foreground text-lg pt-3 border-t border-border">
              <span>Total</span>
              <span>₦{formatPrice(total)}</span>
            </div>
          </div>

          {/* Place Order Button */}
          <Button
            onClick={handlePlaceOrder}
            disabled={isProcessing || !canPlaceOrder}
            size="lg"
            className="w-full h-12 text-base font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay ₦{formatPrice(total)}
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {paymentError && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {paymentError}
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            By placing this order, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Add some items to your cart before checking out.
      </p>
      <Button asChild size="lg">
        <Link href="/menu">Browse menu</Link>
      </Button>
    </div>
  )
}

function CheckoutSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-48 rounded-2xl bg-muted animate-pulse" />
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
        <div className="h-40 rounded-2xl bg-muted animate-pulse" />
      </div>
      <div className="lg:col-span-1">
        <div className="h-96 rounded-2xl bg-muted animate-pulse" />
      </div>
    </div>
  )
}
