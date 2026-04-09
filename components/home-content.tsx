"use client"

import { useState, useMemo } from "react"
import { HeroBanner } from "@/components/hero-banner"
import { MenuCategories } from "@/components/menu-categories"
import { PopularDishes } from "@/components/popular-dishes"
import type { Category, FoodWithCategory } from "@/lib/db/types"

interface HomeContentProps {
  categories: Category[]
  foods: FoodWithCategory[]
}

export function HomeContent({ categories, foods }: HomeContentProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  const filteredFoods = useMemo(() => {
    if (selectedCategoryId == null) return foods
    return foods.filter((f) => f.category_id === selectedCategoryId)
  }, [foods, selectedCategoryId])

  const selectedCategory = selectedCategoryId != null
    ? categories.find((c) => c.id === selectedCategoryId)
    : null

  return (
    <>
      <HeroBanner foods={foods} />
      <MenuCategories
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategoryId={setSelectedCategoryId}
      />
      <PopularDishes
        foods={filteredFoods}
        title={selectedCategory ? selectedCategory.name : "Popular dishes"}
        subtitle={selectedCategory ? `Dishes in ${selectedCategory.name}` : "Crowd favourites that our customers order again and again."}
      />
    </>
  )
}
