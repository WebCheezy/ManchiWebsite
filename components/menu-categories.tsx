"use client"

import Link from "next/link"
import { Utensils } from "lucide-react"
import type { Category } from "@/lib/db/types"

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=120&h=120&fit=crop&q=80"

interface MenuCategoriesProps {
  categories: Category[]
  selectedCategoryId?: number | null
  onSelectCategoryId?: (id: number | null) => void
}

export function MenuCategories({ categories, selectedCategoryId = null, onSelectCategoryId }: MenuCategoriesProps) {
  const selectedId = selectedCategoryId ?? null
  const setSelectedId = onSelectCategoryId ?? (() => {})

  return (
    <section id="menu" className="py-4">
      <div className="space-y-4 rounded-2xl border border-border bg-card px-3 py-4 sm:px-4 sm:py-5 lg:px-5">
        {/* Mobile-first header: stack title; keep chips full-width below */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-9 sm:w-9">
              <Utensils className="h-5 w-5 text-primary sm:h-[18px] sm:w-[18px]" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5 sm:pt-0">
              <h2 className="text-base font-semibold text-foreground leading-tight sm:text-lg">
                What are you in the mood for?
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-snug sm:text-sm">
                Browse by popular Manchi categories.
              </p>
              <Link
                href="/menu"
                className="mt-2 inline-flex text-xs font-medium text-primary hover:underline sm:hidden"
              >
                See full menu
              </Link>
            </div>
          </div>
          <Link
            href="/menu"
            className="hidden sm:inline-flex shrink-0 items-center rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground hover:border-primary/50 hover:bg-card transition-colors"
          >
            See all
          </Link>
        </div>

        <div className="relative -mx-1 sm:mx-0">
          <div
            className="flex gap-2 overflow-x-auto px-1 pb-2 pt-1 sm:px-0 sm:pb-1 sm:pt-0 no-scrollbar scroll-smooth snap-x snap-mandatory sm:snap-none"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-pressed={selectedId === null}
              className={`snap-start shrink-0 inline-flex items-center justify-center min-h-[44px] rounded-full border px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors sm:min-h-0 sm:py-1.5 sm:text-sm ${
                selectedId === null
                  ? "border-primary/60 bg-primary/10 text-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/60 hover:bg-card"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedId(cat.id)}
                aria-pressed={selectedId === cat.id}
                className={`snap-start shrink-0 inline-flex items-center gap-2.5 min-h-[44px] rounded-full border px-3.5 py-2 text-sm whitespace-nowrap transition-colors sm:min-h-0 sm:py-1.5 ${
                  selectedId === cat.id
                    ? "border-primary/60 bg-primary/10 font-medium text-foreground"
                    : "border-border bg-background font-medium text-foreground hover:border-primary/60 hover:bg-card"
                }`}
              >
                <div className="h-7 w-7 overflow-hidden rounded-full bg-muted border border-border/60 sm:h-6 sm:w-6">
                  <img
                    src={cat.image_url || PLACEHOLDER_IMAGE}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
