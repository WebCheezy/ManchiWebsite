import { Header } from "@/components/header"
import { HomeContent } from "@/components/home-content"
import { Footer } from "@/components/footer"
import { getCategories, getFoods } from "@/lib/db"
import { getUser } from "@/lib/auth.server"
import { getAddresses } from "@/lib/db/addresses.server"
import { getProfileServer } from "@/lib/db/profiles.server"
import { isPhoneMissing } from "@/lib/db/profiles"

export default async function Home() {
  const user = await getUser()
  const [categories, foods, addresses, profile] = await Promise.all([
    getCategories(),
    getFoods(),
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
        foods={foods}
      />
      <main className="max-w-6xl mx-auto px-4 lg:px-0 space-y-12 py-10">
        <HomeContent categories={categories} foods={foods} />
      </main>
      <Footer />
    </div>
  )
}
