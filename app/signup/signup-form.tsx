"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "@/lib/auth"

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
        className="h-9 w-auto hidden dark:block"
      />
    </Link>
  )
}

function CloseButton({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="fixed top-4 right-4 z-10 flex items-center justify-center w-11 h-11 rounded-full bg-foreground/10 hover:bg-foreground/20 text-foreground border border-border shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      aria-label="Close and go back"
    >
      <X className="h-6 w-6 stroke-[2.5]" />
    </Link>
  )
}

function SignupFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const em = email.trim()
    if (!em) {
      setError("Please enter your email address.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      const { user, session, error: authError } = await signUp(em, password)
      if (authError) {
        setError(authError)
        return
      }
      if (session && user) {
        router.push(redirectTo)
        router.refresh()
        return
      }
      if (user) {
        setSuccessMessage(
          "Account created. Check your email for a confirmation link if required, then you can log in."
        )
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CloseButton href={redirectTo || "/"} />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <ManchiLogo />
            <h1 className="mt-8 text-2xl font-bold text-foreground">Create your account</h1>
            <p className="mt-2 text-muted-foreground">Sign up with your email and a password.</p>
          </div>

          {successMessage ? (
            <div className="space-y-6 text-center">
              <div className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-foreground">{successMessage}</div>
              <Button asChild className="w-full" size="lg">
                <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`}>Go to log in</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-email"
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
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signup-confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                  className="font-medium text-primary hover:underline"
                >
                  Log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export function SignupForm() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SignupFormInner />
    </Suspense>
  )
}
