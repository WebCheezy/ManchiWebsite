import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AccountNav } from "@/components/account"
import { getUser } from "@/lib/auth.server"
import { getAddresses } from "@/lib/db/addresses.server"
import { getProfileServer } from "@/lib/db/profiles.server"
import { isPhoneMissing } from "@/lib/db/profiles"
import { getFoods } from "@/lib/db"

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/account")
  }

  const [addresses, profile, foods] = await Promise.all([
    getAddresses(user.id),
    getProfileServer(user.id),
    getFoods(),
  ])

  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0] ?? null
  const profileIncomplete = isPhoneMissing(profile)

  return (
    <div className="min-h-screen bg-background">
      <Header
        addresses={addresses}
        selectedAddress={defaultAddress}
        userId={user.id}
        profileIncomplete={profileIncomplete}
        foods={foods}
      />
      <main className="max-w-5xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-4">
              <div className="mb-4 pb-4 border-b border-border">
                <p className="font-semibold text-foreground">
                  {profile?.full_name || user.email?.split("@")[0] || "User"}
                </p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
              <AccountNav profileIncomplete={profileIncomplete} />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
