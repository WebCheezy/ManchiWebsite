import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { getFoods } from "@/lib/db"
import { getUser } from "@/lib/auth.server"
import { getAddresses } from "@/lib/db/addresses.server"
import { getProfileServer } from "@/lib/db/profiles.server"
import { isPhoneMissing } from "@/lib/db/profiles"

export const metadata = {
  title: "Support | Manchi",
  description: "Contact Manchi support.",
}

const SUPPORT_MAILTO =
  "mailto:hi@manchi.ng?cc=manchi_takeout@gmail.com&subject=Support%20Request&body=Dear%20Team%2C%0A%0AI%20need%20help%20with%3A%20(fill%20in%20details)%0A%0AFull%20name%3A%20(fill%20in%20your%20details)%0AEmail%20Address%3A%20(fill%20in%20your%20details)%0A%0AThank%20You"

export default async function SupportPage() {
  const user = await getUser()
  const [foods, addresses, profile] = await Promise.all([
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
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12 lg:px-0">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">Support</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Tap the button below to open your email app and contact support.
          </p>

          <div className="mt-6">
            <Button asChild size="lg">
              <a href={SUPPORT_MAILTO}>Contact us</a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
