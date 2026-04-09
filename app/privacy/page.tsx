import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PrivacyBody } from "@/components/legal/privacy-body"
import { getFoods } from "@/lib/db"
import { getUser } from "@/lib/auth.server"
import { getAddresses } from "@/lib/db/addresses.server"
import { getProfileServer } from "@/lib/db/profiles.server"
import { isPhoneMissing } from "@/lib/db/profiles"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Privacy Policy | Manchi",
  description: "How Manchi Takeout collects, uses, and protects your personal information.",
}

export default async function PrivacyPage() {
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
          <PrivacyBody />
        </div>
      </main>
      <Footer />
    </div>
  )
}
