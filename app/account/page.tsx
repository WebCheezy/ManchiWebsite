import { getUser } from "@/lib/auth.server"
import { getProfileServer } from "@/lib/db/profiles.server"
import { ProfileForm } from "@/components/account"

export const metadata = {
  title: "My Profile | Manchi",
  description: "Manage your profile information",
}

export default async function AccountPage() {
  const user = await getUser()
  const profile = user ? await getProfileServer(user.id) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <ProfileForm
          profile={profile}
          userId={user?.id ?? ""}
          email={user?.email ?? ""}
        />
      </div>
    </div>
  )
}
