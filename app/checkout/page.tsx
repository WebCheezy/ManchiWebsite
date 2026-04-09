import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getUser } from "@/lib/auth.server"
import { getAddresses } from "@/lib/db/addresses.server"
import { getProfileServer } from "@/lib/db/profiles.server"
import { isPhoneMissing } from "@/lib/db/profiles"
import { getFoods } from "@/lib/db"
import { resolveTransportFeeNaira } from "@/lib/db/transport-prices.server"
import { CheckoutContent } from "./checkout-content"

export default async function CheckoutPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/checkout")
  }

  const [addresses, profile, foods] = await Promise.all([
    getAddresses(user.id),
    getProfileServer(user.id),
    getFoods(),
  ])

  const profileIncomplete = isPhoneMissing(profile)

  if (profileIncomplete) {
    redirect("/account?message=phone-required")
  }

  // Allow checkout with no addresses when user chooses pickup (handled in client)
  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0]
  const defaultAddressId = defaultAddress?.id ?? ""
  const initialTransportFeeNaira = defaultAddress
    ? await resolveTransportFeeNaira(defaultAddress.lga, defaultAddress.state)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Header
        addresses={addresses}
        selectedAddress={defaultAddress}
        userId={user.id}
        profileIncomplete={profileIncomplete}
        foods={foods}
      />

      <main className="max-w-4xl mx-auto px-4 lg:px-0 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Checkout</h1>
        <CheckoutContent
          addresses={addresses}
          defaultAddressId={defaultAddressId}
          initialTransportFeeNaira={initialTransportFeeNaira}
        />
      </main>

      <Footer />
    </div>
  )
}
