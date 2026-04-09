"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, MapPin, ShoppingBag, LogOut } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"

const navItems = [
  {
    label: "Profile",
    href: "/account",
    icon: User,
    requiresAction: true,
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: MapPin,
    requiresAction: false,
  },
  {
    label: "Orders",
    href: "/account/orders",
    icon: ShoppingBag,
    requiresAction: false,
  },
]

interface AccountNavProps {
  profileIncomplete?: boolean
}

export function AccountNav({ profileIncomplete = false }: AccountNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const showBadge = item.requiresAction && profileIncomplete
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="relative">
              <item.icon className="h-4 w-4" />
              {showBadge && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-destructive" />
              )}
            </span>
            {item.label}
            {showBadge && (
              <span className="ml-auto text-[10px] text-destructive font-medium">Required</span>
            )}
          </Link>
        )
      })}
      <hr className="my-2 border-border" />
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </nav>
  )
}
