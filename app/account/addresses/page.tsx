import { getUser } from "@/lib/auth.server"
import { getAddresses } from "@/lib/db/addresses.server"
import { AddressList } from "@/components/address"

export const metadata = {
  title: "My Addresses | Manchi",
  description: "Manage your delivery addresses",
}

export default async function AddressesPage() {
  const user = await getUser()
  const addresses = user ? await getAddresses(user.id) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Addresses</h1>
        <p className="text-sm text-muted-foreground">
          Add and manage your delivery addresses
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <AddressList addresses={addresses} userId={user?.id ?? ""} />
      </div>
    </div>
  )
}
