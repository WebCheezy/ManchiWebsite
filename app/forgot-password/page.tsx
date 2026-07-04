"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Mail } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

const FORGOT_PASSWORD_SUCCESS_MESSAGE =
  "If an account exists for that email, a reset code has been sent."

function ManchiLogo() {
  return (
    <Link href="/" className="inline-block focus:outline-none focus:ring-2 focus:ring-primary rounded">
      <Image
        src="/logos/manchi-primary.png"
        alt="Manchi"
        width={140}
        height={44}
        className="h-9 w-auto dark:hidden"
      />
      <Image
        src="/logos/manchi-primary-dark-mode.png"
        alt="Manchi"
        width={140}
        height={44}
        className="hidden h-9 w-auto dark:block"
      />
    </Link>
  )
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      toast.error("Enter your email address to continue.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      if (!response.ok) {
        throw new Error("Forgot password request failed")
      }

      setSuccess(true)
      toast.success(FORGOT_PASSWORD_SUCCESS_MESSAGE)
    } catch {
      toast.error("We couldn't process your request right now. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-6 text-center">
            <div>
              <ManchiLogo />
              <h1 className="mt-8 text-2xl font-bold text-foreground">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">{FORGOT_PASSWORD_SUCCESS_MESSAGE}</p>
            </div>
            <Button
              type="button"
              className="w-full"
              size="lg"
              onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`)}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <ManchiLogo />
            <h1 className="mt-8 text-2xl font-bold text-foreground">Forgot your password?</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email address to receive a 6-digit reset code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Sending code...
                </>
              ) : (
                <>
                  Send reset code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
