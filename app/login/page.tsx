"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight, KeyRound, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, sendEmailCode, verifyEmailCode } from "@/lib/auth"

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

type Step = "choose" | "email-code" | "enter-code" | "password"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"

  const [step, setStep] = useState<Step>("choose")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendDone, setResendDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResendCode = async () => {
    setError(null)
    setIsResending(true)
    setResendDone(false)
    try {
      const { success, error: err } = await sendEmailCode(email.trim(), redirectTo)
      if (err) setError(err)
      else setResendDone(true)
    } finally {
      setIsResending(false)
    }
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }
    setIsLoading(true)
    try {
      const { success, error: err } = await sendEmailCode(email.trim(), redirectTo)
      if (err) {
        setError(err)
        return
      }
      setStep("enter-code")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmed = code.replace(/\s/g, "")
    if (trimmed.length !== 6) {
      setError("Please enter the 6-digit code from your email.")
      return
    }
    setIsLoading(true)
    try {
      const { user, error: err } = await verifyEmailCode(email.trim(), trimmed)
      if (err) {
        setError(err)
        return
      }
      if (user) {
        router.push(redirectTo)
        router.refresh()
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const { user, error: authError } = await signIn(email, password)
      if (authError) {
        setError(authError)
        return
      }
      if (user) {
        router.push(redirectTo)
        router.refresh()
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Step: Enter the 6-digit code ─────────────────────────────────────────
  if (step === "enter-code") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <CloseButton href={redirectTo || "/"} />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <ManchiLogo />
              <h1 className="mt-8 text-2xl font-bold text-foreground">Check your email</h1>
              <p className="mt-2 text-muted-foreground">
                We sent a 6-digit code to <strong className="text-foreground">{email}</strong>. Enter it below.
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  disabled={isLoading}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Can&apos;t find the email? Check your spam folder.
                </p>
              </div>
              {resendDone && (
                <p className="text-sm text-primary text-center">New code sent. Check your email.</p>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={isLoading || code.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify and continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <div className="flex flex-col items-center gap-2 text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending || isLoading}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Resend code"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("email-code")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Use a different email
                </button>
                <p className="text-sm text-muted-foreground">
                  New here?{" "}
                  <Link
                    href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ─── Step: Enter email (for code) or Choose method ─────────────────────────
  if (step === "email-code") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <CloseButton href={redirectTo || "/"} />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <ManchiLogo />
              <h1 className="mt-8 text-2xl font-bold text-foreground">Sign in with email code</h1>
              <p className="mt-2 text-muted-foreground">
                We&apos;ll email you a 6-digit one-time code (OTP).
              </p>
            </div>

            <form onSubmit={handleSendCode} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    Send me a code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setStep("choose")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back
                </button>
                <p className="text-sm text-muted-foreground">
                  New here?{" "}
                  <Link
                    href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ─── Step: Password sign-in form ──────────────────────────────────────────
  if (step === "password") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <CloseButton href={redirectTo || "/"} />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <ManchiLogo />
              <h1 className="mt-8 text-2xl font-bold text-foreground">Sign in with password</h1>
              <p className="mt-2 text-muted-foreground">
                Use the email and password from your account.
              </p>
            </div>

            <form onSubmit={handlePasswordSignIn} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="pw-email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="pw-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pw-password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="pw-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
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
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setStep("choose")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Back
                </button>
                <p className="text-sm text-muted-foreground">
                  New here?{" "}
                  <Link
                    href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ─── Step: Choose how to sign in ──────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CloseButton href={redirectTo || "/"} />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <ManchiLogo />
            <h1 className="mt-8 text-2xl font-bold text-foreground">Log in</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in with your password, or with a one-time code we send to your email.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              type="button"
              className="w-full h-14 text-base font-medium"
              size="lg"
              onClick={() => setStep("password")}
            >
              <KeyRound className="mr-3 h-5 w-5" />
              Sign in with password
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              For accounts created with email and password.
            </p>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-base font-medium"
              size="lg"
              onClick={() => setStep("email-code")}
            >
              <Mail className="mr-3 h-5 w-5" />
              Sign in with email code
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              We&apos;ll email you a 6-digit one-time code (OTP).
            </p>

            <p className="text-center text-sm text-muted-foreground pt-2">
              Don&apos;t have an account?{" "}
              <Link
                href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
