import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getCategories, getFoods } from "@/lib/db"
import { getUser } from "@/lib/auth.server"
import { getAddresses } from "@/lib/db/addresses.server"
import { getProfileServer } from "@/lib/db/profiles.server"
import { isPhoneMissing } from "@/lib/db/profiles"
import { MenuContent } from "./menu-content"

interface MenuPageProps {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams
  const categoryId = params.category ? parseInt(params.category, 10) : null
  const searchQuery = params.q || ""

  const user = await getUser()
  const [categories, foods, allFoods, addresses, profile] = await Promise.all([
    getCategories(),
    getFoods({
      categoryId: isNaN(categoryId as number) ? null : categoryId,
      search: searchQuery,
    }),
    getFoods(), // All foods for header search autocomplete
    user ? getAddresses(user.id) : Promise.resolve([]),
    user ? getProfileServer(user.id) : Promise.resolve(null),
  ])

  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0] ?? null
  const profileIncomplete = user ? isPhoneMissing(profile) : false

  return (
    <div className="min-h-screen bg-background">
      <Header
        addresses={addresses}
        selectedAddress={defaultAddress}
        userId={user?.id ?? null}
        profileIncomplete={profileIncomplete}
        foods={allFoods}
      />

      <main className="max-w-6xl mx-auto px-4 lg:px-0 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Our Menu</h1>
          <p className="mt-2 text-muted-foreground">
            Explore our delicious selection of authentic Nigerian dishes
          </p>
        </div>

        <Suspense fallback={<MenuSkeleton />}>
          <MenuContent
            categories={categories}
            foods={foods}
            selectedCategoryId={categoryId}
            searchQuery={searchQuery}
          />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}

function MenuSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-24 rounded-full bg-muted animate-pulse shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl bg-muted animate-pulse h-72" />
        ))}
      </div>
    </div>
  )
}
