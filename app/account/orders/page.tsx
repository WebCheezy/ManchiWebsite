import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth.server"
import { getOrdersForUser } from "@/lib/db/orders.server"
import { formatPrice } from "@/lib/format"
import type { Order } from "@/lib/db/types"

export const metadata = {
  title: "My Orders | Manchi",
  description: "View your order history",
}

function OrderCard({ order, displayIndex }: { order: Order; displayIndex: number }) {
  const date = new Date(order.created_at)
  const itemsJson = order.items as unknown
  const cartItems: any[] = Array.isArray(itemsJson)
    ? itemsJson
    : (itemsJson && typeof itemsJson === "object" && "cart_items" in itemsJson
        ? (itemsJson as { cart_items?: unknown[] } | null)?.cart_items
        : undefined) ?? []

  const lineCount = cartItems.length

  const firstItem = cartItems[0] ?? null
  const previewName = firstItem?.name ?? firstItem?.foodName ?? "Item"
  const previewImage = firstItem?.image_url ?? firstItem?.foodImage ?? null
  const previewExtraImages = cartItems.slice(1, 3)

  const breakdownUnitPriceFor = (it: any) => it?.price_at_time ?? it?.priceAtTime ?? it?.foodPrice ?? null
  const breakdownTotalFor = (it: any) => {
    const unit = breakdownUnitPriceFor(it)
    const qty = Number(it?.quantity ?? 1)
    if (typeof unit !== "number") return null
    return unit * qty
  }

  const requiredSideLabel = (it: any) =>
    it?.side_id != null ? `Required side #${it.side_id}` : null

  const optionsLabel = (it: any) => {
    if (!Array.isArray(it?.options) || it.options.length === 0) return null
    // options are expected to look like { side_id, quantity }
    const parts = it.options
      .map((opt: any) => {
        if (opt?.side_id == null) return null
        const q = opt?.quantity ?? 1
        return `${q}x side #${opt.side_id}`
      })
      .filter(Boolean)
    return parts.length ? parts.join(", ") : null
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5 transition-shadow hover:shadow-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/10" />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[180px]">
          <p className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Order #{displayIndex}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {date.toLocaleString("en-NG", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            order.status === "paid"
              ? "bg-green-500/15 text-green-700 dark:text-green-400"
              : order.status === "awaiting_payment"
                ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {order.delivery_method === "pickup" ? "Pickup" : "Delivery"} · {order.location ?? "—"}
        </span>

        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-foreground">₦{formatPrice(order.total_amount)}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex -space-x-2">
            {previewImage ? (
              <img
                src={previewImage}
                alt={previewName}
                className="h-10 w-10 rounded-full border border-border bg-muted object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-10 w-10 rounded-full border border-border bg-muted" />
            )}
            {previewExtraImages.map((it: any, idx: number) => {
              const img = it?.image_url ?? it?.foodImage
              const name = it?.name ?? it?.foodName ?? "Item"
              return img ? (
                <img
                  key={`${idx}-${name}`}
                  src={img}
                  alt={name}
                  className="h-10 w-10 rounded-full border border-border bg-muted object-cover"
                  loading="lazy"
                />
              ) : null
            })}
          </div>

          <div className="min-w-0">
            {lineCount > 0 ? (
              <p className="text-sm text-muted-foreground truncate">
                {lineCount} item{lineCount !== 1 ? "s" : ""} · {previewName}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Items unavailable</p>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground whitespace-nowrap">VAT included when applicable</p>
      </div>

      {/* Order breakdown */}
      {lineCount > 0 && (
        <div className="mt-4">
          <details className="group">
            <summary className="cursor-pointer select-none list-none text-sm font-semibold text-foreground/90 hover:text-primary">
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/60 group-open:bg-primary/10 group-open:border-primary/30">
                  +
                </span>
                View breakdown ({lineCount})
              </span>
            </summary>

            <div className="mt-3 rounded-2xl border border-border/60 bg-background/50 p-3 sm:p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {order.delivery_method === "pickup" ? "Pickup" : "Delivery"} · {order.location ?? "—"}
                  {order.delivery_address ? ` · ${order.delivery_address}` : ""}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  VAT: ₦{formatPrice(order.vat)}
                </p>
              </div>

              <div className="mt-3 space-y-3">
                {cartItems.map((it: any, idx: number) => {
                  const name = it?.name ?? it?.foodName ?? `Item ${idx + 1}`
                  const unit = breakdownUnitPriceFor(it)
                  const total = breakdownTotalFor(it)
                  const qty = Number(it?.quantity ?? 1)
                  const img = it?.image_url ?? it?.foodImage ?? null
                  const requiredSide = requiredSideLabel(it)
                  const optionsText = optionsLabel(it)

                  return (
                    <div
                      key={`${order.id}-${idx}-${name}`}
                      className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card/40 p-3"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        {img ? (
                          <img
                            src={img}
                            alt={name}
                            className="h-12 w-12 rounded-xl border border-border bg-muted object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl border border-border bg-muted" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground mt-1">Qty: {qty}</p>
                          {requiredSide && <p className="text-xs text-muted-foreground mt-1">{requiredSide}</p>}
                          {optionsText && <p className="text-xs text-muted-foreground mt-1">Optional: {optionsText}</p>}
                        </div>
                      </div>

                      <div className="text-right">
                        {typeof unit === "number" ? (
                          <p className="text-sm font-semibold text-foreground">₦{formatPrice(unit)}</p>
                        ) : (
                          <p className="text-sm font-semibold text-foreground">—</p>
                        )}
                        {typeof total === "number" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Total: ₦{formatPrice(total)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

export default async function OrdersPage() {
  const user = await getUser()
  if (!user) {
    redirect("/login?redirect=/account/orders")
  }

  const orders = await getOrdersForUser(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="text-sm text-muted-foreground">
          View your order history and track deliveries
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">No orders yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Once you place an order and complete payment, it will appear here.
            </p>
            <Link href="/menu">
              <Button className="mt-6">Browse menu</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <OrderCard key={order.id} order={order} displayIndex={idx + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
