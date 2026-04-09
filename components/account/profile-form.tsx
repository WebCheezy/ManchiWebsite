"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, User, Phone, Mail, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Profile } from "@/lib/db/types"
import { updateProfile, isPhoneMissing } from "@/lib/db/profiles"

interface ProfileFormProps {
  profile: Profile | null
  userId: string
  email: string
}

export function ProfileForm({ profile, userId, email }: ProfileFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile?.full_name ?? "")
  const [phone, setPhone] = useState(profile?.phone ?? profile?.phone_number ?? "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const phoneMissing = isPhoneMissing(profile)

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email?.[0]?.toUpperCase() ?? "U"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!phone || phone.trim().length === 0) {
      setError("Phone number is required to place orders")
      return
    }

    setIsLoading(true)

    try {
      const updated = await updateProfile(userId, {
        full_name: fullName || null,
        phone: phone || null,
      })

      if (!updated) {
        setError("Failed to update profile. Please try again.")
        return
      }

      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {phoneMissing && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Phone number required</p>
            <p className="text-sm text-destructive/80">
              Please add your phone number to place orders. We&apos;ll use it to contact you about your delivery.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
          Profile updated successfully!
        </div>
      )}

      {/* Avatar section */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile?.avatar_url ?? undefined} alt={fullName || "User"} />
          <AvatarFallback className="text-lg bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{fullName || "Add your name"}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              className="pl-10 bg-muted"
              disabled
            />
          </div>
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-1">
            Phone Number
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Phone className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${phoneMissing ? "text-destructive" : "text-muted-foreground"}`} />
            <Input
              id="phone"
              type="tel"
              placeholder="+234 800 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`pl-10 ${phoneMissing ? "border-destructive focus-visible:ring-destructive" : ""}`}
              disabled={isLoading}
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">Required for delivery contact</p>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  )
}
