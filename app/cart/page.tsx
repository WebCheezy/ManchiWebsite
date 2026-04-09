import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getUser } from "@/lib/auth.server"
import { getAddresses } from "@/lib/db/addresses.server"
import { getProfileServer } from "@/lib/db/profiles.server"
import { isPhoneMissing } from "@/lib/db/profiles"
import { getFoods } from "@/lib/db"
import { resolveTransportFeeNaira } from "@/lib/db/transport-prices.server"
import { CartContent } from "./cart-content"

export default async function CartPage() {
  const user = await getUser()
  const [addresses, profile, foods] = await Promise.all([
    user ? getAddresses(user.id) : Promise.resolve([]),
    user ? getProfileServer(user.id) : Promise.resolve(null),
    getFoods(),
  ])

  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0] ?? null
  const profileIncomplete = user ? isPhoneMissing(profile) : false
  const defaultTransportFeeNaira = defaultAddress
    ? await resolveTransportFeeNaira(defaultAddress.lga, defaultAddress.state)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Header
        addresses={addresses}
        selectedAddress={defaultAddress}
        userId={user?.id ?? null}
        profileIncomplete={profileIncomplete}
        foods={foods}
      />

      <main className="max-w-4xl mx-auto px-4 lg:px-0 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Your Cart</h1>
        <CartContent
          userId={user?.id ?? null}
          profileIncomplete={profileIncomplete}
          hasAddress={addresses.length > 0}
          defaultTransportFeeNaira={defaultTransportFeeNaira}
          defaultAddressLga={defaultAddress?.lga ?? null}
          defaultAddressState={defaultAddress?.state ?? null}
        />
      </main>

      <Footer />
    </div>
  )
}
