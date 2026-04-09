import Link from "next/link"
import { CheckCircle, Home, ShoppingBag, Clock, AlertTriangle, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutSuccessClearCart } from "@/components/checkout-success-clear-cart"
import { getUser } from "@/lib/auth.server"
import { getAddresses } from "@/lib/db/addresses.server"
import { getProfileServer } from "@/lib/db/profiles.server"
import { isPhoneMissing } from "@/lib/db/profiles"
import { getFoods } from "@/lib/db"
import { verifyAndCompleteOrder } from "@/lib/db/orders.server"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string; location?: string; reference?: string; trxref?: string }>
}) {
  const params = await searchParams
  const { method: methodParam, location: locationParam } = params
  const paystackRef = params.reference ?? params.trxref

  let paymentError: string | null = null
  if (paystackRef) {
    const result = await verifyAndCompleteOrder(paystackRef)
    if (!result.ok) {
      paymentError = result.error ?? "We could not confirm your payment."
    }
  }

  const paymentVerified = Boolean(paystackRef && !paymentError)
  const paymentDeclined = Boolean(paystackRef && paymentError)
  const missingPaystackReference = !paystackRef

  const isPickup = methodParam === "pickup"
  const branchDisplay: Record<string, string> = {
    Chasemall: "Enugu — Chasemall",
    Aurora: "Port Harcourt — Aurora",
    Eromo: "Port Harcourt — Eromo",
  }
  const storeLocation =
    locationParam && branchDisplay[locationParam] ? branchDisplay[locationParam] : null

  const user = await getUser()
  const [addresses, profile, foods] = await Promise.all([
    user ? getAddresses(user.id) : Promise.resolve([]),
    user ? getProfileServer(user.id) : Promise.resolve(null),
    getFoods(),
  ])

  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0] ?? null
  const profileIncomplete = user ? isPhoneMissing(profile) : false

  return (
    <div className="min-h-screen bg-background">
      {paymentVerified && paystackRef && <CheckoutSuccessClearCart paymentReference={paystackRef} />}
      <Header
        addresses={addresses}
        selectedAddress={defaultAddress}
        userId={user?.id ?? null}
        profileIncomplete={profileIncomplete}
        foods={foods}
      />

      <main className="max-w-2xl mx-auto px-4 lg:px-0 py-16">
        <div className="text-center">
          {/* Icon: success / declined / incomplete return */}
          <div
            className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
              paymentVerified
                ? "bg-green-100 dark:bg-green-900/30"
                : paymentDeclined
                  ? "bg-destructive/10"
                  : "bg-muted"
            }`}
          >
            {paymentVerified ? (
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            ) : paymentDeclined ? (
              <AlertTriangle className="h-10 w-10 text-destructive" />
            ) : (
              <HelpCircle className="h-10 w-10 text-muted-foreground" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3">
            {paymentVerified
              ? "Order placed successfully!"
              : paymentDeclined
                ? "Payment not completed"
                : "No payment session"}
          </h1>

          {missingPaystackReference && (
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              This page is shown after Paystack redirects back with a payment reference. If you opened this link
              directly, your cart is unchanged. Return to checkout to pay, or continue shopping.
            </p>
          )}

          {paymentDeclined && paystackRef && (
            <div className="mb-8 max-w-md mx-auto rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-left">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">We couldn&apos;t verify this payment</p>
                  <p className="text-sm text-muted-foreground mt-1">{paymentError}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your cart is still available. If you were charged, contact us at{" "}
                    <a href="mailto:hi@manchi.ng" className="text-primary font-medium">
                      hi@manchi.ng
                    </a>{" "}
                    with your reference: <code className="text-xs">{paystackRef}</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {paymentVerified && (
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Thank you for your order. We&apos;ve received it and will start preparing your delicious meal right away.
            </p>
          )}

          {/* Order Info Card — only after verified payment */}
          {paymentVerified && (
          <div className="rounded-2xl border border-border bg-card p-6 mb-8 text-left">
            <h2 className="font-semibold text-foreground mb-4">What happens next?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Order Confirmed</p>
                  <p className="text-sm text-muted-foreground">
                    We've received your order and payment is being processed.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-muted-foreground">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Preparing Your Food</p>
                  <p className="text-sm text-muted-foreground">
                    Our chefs will prepare your meal with fresh ingredients.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-muted-foreground">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {isPickup ? "Ready for Pickup" : "On the Way"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPickup
                      ? "Come to our restaurant to collect your order when we notify you."
                      : "A rider will pick up your order and deliver it to you."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border space-y-2">
              {storeLocation && (
                <p className="text-sm text-muted-foreground">
                  Your order will be prepared at <strong className="text-foreground">Manchi, {storeLocation}</strong>.
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {isPickup
                    ? "Estimated ready for pickup: 15-20 minutes"
                    : "Estimated delivery: 30-45 minutes"}
                </span>
              </div>
            </div>
          </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {paymentVerified && (
              <Button asChild size="lg">
                <Link href="/account/orders">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  View My Orders
                </Link>
              </Button>
            )}
            {(missingPaystackReference || paymentDeclined) && (
              <Button asChild size="lg" variant={paymentDeclined ? "default" : "outline"}>
                <Link href="/checkout">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Back to checkout
                </Link>
              </Button>
            )}
            <Button asChild variant={paymentVerified ? "outline" : "default"} size="lg">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
