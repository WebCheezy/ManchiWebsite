"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import {
  Menu,
  ShoppingCart,
  SunMedium,
  MoonStar,
  UserCircle2,
  LogIn,
  Home,
  UtensilsCrossed,
  Star,
  ClipboardList,
  ChevronRight,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { HeaderAddressPicker } from "@/components/address"
import { SearchAutocomplete } from "@/components/search-autocomplete"
import { BrowseAccuracyBanner } from "@/components/browse-accuracy-banner"
import { useCart } from "@/lib/cart"
import type { Address, FoodWithCategory } from "@/lib/db/types"
import {
  BranchAvailabilitySync,
} from "@/lib/browse/branch-availability-context"

interface HeaderProps {
  addresses?: Address[]
  selectedAddress?: Address | null
  userId?: string | null
  profileIncomplete?: boolean
  foods?: FoodWithCategory[]
  onAddressChange?: (address: Address) => void
}

export function Header({
  addresses = [],
  selectedAddress = null,
  userId = null,
  profileIncomplete = false,
  foods = [],
  onAddressChange,
}: HeaderProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { itemCount, deliveryMethod, setDeliveryMethod } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md shadow-sm">
      <BranchAvailabilitySync userId={userId} addressCount={addresses.length} />
      {/* Main row */}
      <div className="px-3 py-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-2 shrink-0">
            {mounted ? (
              <Sheet>
                <SheetTrigger asChild>
                  <button aria-label="Open menu" className="text-foreground p-1 -ml-1">
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-80 p-0 border-r border-border/50 bg-background flex flex-col"
                >
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                  {/* Header with Logo - Fixed */}
                  <div className="shrink-0 px-6 pt-6 pb-4">
                    <Link href="/" className="flex items-center">
                      <Image
                        src="/logos/manchi-primary.png"
                        alt="Manchi"
                        width={110}
                        height={36}
                        className="h-8 w-auto dark:hidden"
                      />
                      <Image
                        src="/logos/manchi-primary-dark-mode.png"
                        alt="Manchi"
                        width={110}
                        height={36}
                        className="h-8 w-auto hidden dark:block"
                      />
                    </Link>
                    {/* Decorative line */}
                    <div className="mt-4 h-px bg-border" />
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto">
                    {/* Main Navigation */}
                    <nav className="px-4 py-2">
                      <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                        Navigate
                      </p>
                      <div className="space-y-1">
                        {[
                          { href: "/", label: "Home", icon: Home },
                          { href: "/menu", label: "Our Menu", icon: UtensilsCrossed },
                          { href: "/account/orders", label: "My Orders", icon: ClipboardList },
                          { href: "/#popular", label: "Popular Dishes", icon: Star },
                        ].map((item) => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-foreground/90 hover:text-foreground hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200"
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-200">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="flex-1 font-medium">{item.label}</span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                            </Link>
                          )
                        })}
                      </div>
                    </nav>

                    {/* Divider */}
                    <div className="mx-6 my-3 h-px bg-border/60" />

                    {/* Account & Settings */}
                    <div className="px-4 py-2 pb-6">
                      <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                        Account
                      </p>
                      <div className="space-y-1">
                        {/* Sign in / Account */}
                        <Link
                          href={userId ? "/account" : "/login"}
                          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-foreground/90 hover:text-foreground hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200"
                        >
                          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-200">
                            {userId ? (
                              <>
                                <UserCircle2 className="h-4 w-4" />
                                {profileIncomplete && (
                                  <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
                                  </span>
                                )}
                              </>
                            ) : (
                              <LogIn className="h-4 w-4" />
                            )}
                          </span>
                          <span className="flex-1">
                            <span className="block font-medium">
                              {userId ? "My Account" : "Sign In"}
                            </span>
                            {userId && profileIncomplete && (
                              <span className="block text-[11px] text-destructive">
                                Complete your profile
                              </span>
                            )}
                            {!userId && (
                              <span className="block text-[11px] text-muted-foreground">
                                Access your orders
                              </span>
                            )}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                        </Link>

                        {/* Theme Toggle */}
                        <button
                          type="button"
                          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-foreground/90 hover:text-foreground hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-200">
                            <span className="relative inline-flex h-4 w-4 items-center justify-center">
                              <SunMedium className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                              <MoonStar className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                            </span>
                          </span>
                          <span className="flex-1 min-w-0 text-left">
                            <span className="block font-medium">Appearance</span>
                            <span className="block text-[11px] text-muted-foreground">
                              {theme === "dark" ? "Dark mode" : "Light mode"}
                            </span>
                          </span>
                          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                            {theme === "dark" ? "Dark" : "Light"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer - Fixed */}
                  <div className="shrink-0 px-6 py-4 border-t border-border/40 bg-muted/30">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>© 2026 Manchi</span>
                      <div className="flex items-center gap-3">
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <button aria-label="Open menu" className="text-foreground p-1 -ml-1">
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}

            <Link href="/" className="flex items-center">
              <Image
                src="/logos/manchi-primary.png"
                alt="Manchi"
                width={100}
                height={32}
                className="h-7 sm:h-8 w-auto dark:hidden"
                priority
              />
              <Image
                src="/logos/manchi-primary-dark-mode.png"
                alt="Manchi"
                width={100}
                height={32}
                className="h-7 sm:h-8 w-auto hidden dark:block"
                priority
              />
            </Link>
          </div>

          {/* Center: Search - hidden on mobile, shown on md+ */}
          <div className="hidden md:flex flex-1 justify-center px-4 max-w-xl">
            <SearchAutocomplete
              foods={foods}
              placeholder="Search for dishes or categories"
              className="w-full"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Delivery/Pickup toggle - hidden on mobile, shown on sm+ */}
            <div className="hidden sm:flex items-center gap-0.5 bg-muted rounded-full p-0.5">
              <button
                onClick={() => setDeliveryMethod("delivery")}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  deliveryMethod === "delivery"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Delivery
              </button>
              <button
                onClick={() => setDeliveryMethod("pickup")}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  deliveryMethod === "pickup"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pickup
              </button>
            </div>

            {/* Location picker */}
            <HeaderAddressPicker
              addresses={addresses}
              selectedAddress={selectedAddress}
              userId={userId}
              onAddressChange={onAddressChange}
            />

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative p-1.5 text-foreground hover:text-primary transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              href={userId ? "/account" : "/login"}
              aria-label={userId ? "Account" : "Sign in"}
              className="relative p-1.5 text-foreground hover:text-primary transition-colors"
            >
              <UserCircle2 className="h-5 w-5" />
              {userId && profileIncomplete && (
                <span className="absolute right-0.5 top-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search bar - shown below main row on small screens */}
        <div className="mt-2 md:hidden">
          <SearchAutocomplete
            foods={foods}
            placeholder="Search for dishes or categories"
            className="w-full"
          />
        </div>

        {/* Mobile delivery/pickup - shown on mobile only */}
        <div className="flex sm:hidden items-center justify-center mt-2">
          <div className="flex items-center gap-0.5 bg-muted rounded-full p-0.5">
            <button
              onClick={() => setDeliveryMethod("delivery")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                deliveryMethod === "delivery"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Delivery
            </button>
            <button
              onClick={() => setDeliveryMethod("pickup")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                deliveryMethod === "pickup"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pickup
            </button>
          </div>
        </div>
      </div>
    </header>
    <BrowseAccuracyBanner />
    </>
  )
}
