"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

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

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromQuery = useMemo(() => searchParams.get("email")?.trim() ?? "", [searchParams])

  const [email, setEmail] = useState(emailFromQuery)
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setEmail(emailFromQuery)
  }, [emailFromQuery])

  useEffect(() => {
    if (!success) return

    const timeout = window.setTimeout(() => {
      router.push("/login")
      router.refresh()
    }, 2000)

    return () => window.clearTimeout(timeout)
  }, [router, success])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedEmail = email.trim()
    const trimmedToken = token.replace(/\D/g, "")

    if (!trimmedEmail) {
      toast.error("Enter your email address to continue.")
      return
    }

    if (trimmedToken.length !== 6) {
      toast.error("Enter the 6-digit code sent to your email.")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, token: trimmedToken, password }),
      })

      if (!response.ok) {
        throw new Error("Reset password request failed")
      }

      setSuccess(true)
      toast.success("Password reset successful.")
    } catch {
      toast.error("We couldn't reset your password. Please check your details and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Password updated</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your password has been reset successfully. Redirecting you to sign in...
              </p>
            </div>
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
            <h1 className="mt-8 text-2xl font-bold text-foreground">Reset your password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the 6-digit code from your email and choose a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">6-digit code</Label>
                <Input
                  id="token"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                  className="text-center font-mono text-2xl tracking-[0.5em]"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Password must be at least 8 characters long.</p>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Resetting password...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to forgot password
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Spinner className="size-8 text-primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
