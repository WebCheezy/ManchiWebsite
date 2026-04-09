"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X, MapPin, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBranchAvailability } from "@/lib/browse/branch-availability-context"

const SESSION_KEY = "manchi-browse-banner-dismissed"

export function BrowseAccuracyBanner() {
  const { applyBranchAvailability } = useBranchAvailability()
  const [bannerState, setBannerState] = useState<{
    ready: boolean
    dismissed: boolean
  }>({ ready: false, dismissed: false })

  useEffect(() => {
    try {
      setBannerState({
        ready: true,
        dismissed: sessionStorage.getItem(SESSION_KEY) === "1",
      })
    } catch {
      setBannerState({ ready: true, dismissed: false })
    }
  }, [])

  const dismiss = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1")
    } catch {
      /* ignore */
    }
    setBannerState((s) => ({ ...s, dismissed: true }))
  }

  if (!bannerState.ready || applyBranchAvailability || bannerState.dismissed) {
    return null
  }

  return (
    <div className="border-b border-primary/15 bg-primary/5 px-3 py-2.5 sm:px-4">
      <div className="max-w-6xl mx-auto flex items-start gap-3 sm:gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MapPin className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-foreground leading-snug">
            You&apos;re browsing the full menu
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
            Sign in and save a delivery address to see what&apos;s in stock at your branch. Until then,
            items may look available even if they aren&apos;t at a specific location.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button asChild size="sm" className="h-8 text-xs">
              <Link href="/login">
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                Sign in
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-8 text-xs">
              <Link href="/signup">Create account</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
              <Link href="/account/addresses">Add address</Link>
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
