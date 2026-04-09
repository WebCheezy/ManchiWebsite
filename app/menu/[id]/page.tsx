import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, Tag } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getFoodById, getFoods } from "@/lib/db/foods"
import { getSidesForFoodGrouped } from "@/lib/db/sides"
import { getUser } from "@/lib/auth.server"
import { getAddresses } from "@/lib/db/addresses.server"
import { getProfileServer } from "@/lib/db/profiles.server"
import { isPhoneMissing } from "@/lib/db/profiles"
import { formatPrice } from "@/lib/format"
import { FoodDetailClient } from "./food-detail-client"

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800&h=600&fit=crop&q=80"

interface FoodDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function FoodDetailPage({ params }: FoodDetailPageProps) {
  const { id } = await params
  const foodId = parseInt(id, 10)

  if (isNaN(foodId)) {
    notFound()
  }

  const food = await getFoodById(foodId)

  if (!food) {
    notFound()
  }

  const user = await getUser()
  const [addresses, profile, relatedFoods, allFoods, sides] = await Promise.all([
    user ? getAddresses(user.id) : Promise.resolve([]),
    user ? getProfileServer(user.id) : Promise.resolve(null),
    food.category_id ? getFoods({ categoryId: food.category_id }) : Promise.resolve([]),
    getFoods(), // All foods for header search autocomplete
    getSidesForFoodGrouped(food.id), // Get sides for this food
  ])

  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0] ?? null
  const profileIncomplete = user ? isPhoneMissing(profile) : false
  const otherFoods = relatedFoods.filter((f) => f.id !== food.id).slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      <Header
        addresses={addresses}
        selectedAddress={defaultAddress}
        userId={user?.id ?? null}
        profileIncomplete={profileIncomplete}
        foods={allFoods}
      />

      <main className="max-w-6xl mx-auto px-4 lg:px-0 py-6">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to menu
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
            <img
              src={food.image_url || PLACEHOLDER_IMAGE}
              alt={food.name}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
            {!food.is_available && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full font-medium">
                  Currently Unavailable
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {food.category && (
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{food.category.name}</span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              {food.name}
            </h1>

            <p className="mt-4 text-muted-foreground leading-relaxed">
              {food.description || "Delicious meal prepared with fresh ingredients and authentic Nigerian spices."}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <span className="text-3xl font-bold text-foreground">
                &#8358;{formatPrice(food.price)}
              </span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">15-30 min delivery</span>
              </div>
            </div>

            <FoodDetailClient food={food} sides={sides} />
          </div>
        </div>

        {/* Related Items */}
        {otherFoods.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              You might also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {otherFoods.map((item) => (
                <Link
                  key={item.id}
                  href={`/menu/${item.id}`}
                  className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={item.image_url || PLACEHOLDER_IMAGE}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-foreground text-sm line-clamp-1">{item.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      &#8358;{formatPrice(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
