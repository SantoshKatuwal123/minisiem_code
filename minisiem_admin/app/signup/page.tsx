"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/components/Logo"
import Link from "next/link"
import { useRegister } from "@/hooks/useAuth"

export default function SignupPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [customError, setCustomError] = useState("")

  const registrationMutation = useRegister()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setCustomError("Passwords do not match")
      return
    }

    setCustomError("")

    registrationMutation.mutate({ fullname: name, email, password })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/40 px-4 w-full overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.1] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
      linear-gradient(to right, currentColor 1px, transparent 1px),
      linear-gradient(to bottom, currentColor 1px, transparent 1px)
    `,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-lg backdrop-blur">
        {/* Logo / Title */}
        <div className="flex mb-6 justify-center">
          <Logo />
        </div>

        {/* Show error */}
        {registrationMutation.isError && (
          <p className="text-red-500 bg-red-50 rounded-md p-2">
            {registrationMutation.error.message || "Registration failed"}
          </p>
        )}

        {customError && (
          <p className="text-red-500 bg-red-200 rounded-md p-2">
            {customError}
          </p>
        )}

        {/* Show error */}
        {registrationMutation.isSuccess && (
          <p className="text-green-500 bg-green-200 rounded-md p-2">
            Registration successful! Redirecting to login...
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ramu prasad"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="ramu@minisim.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={registrationMutation.isPending}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {registrationMutation.isPending ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Signup redirect */}
        <p className="mt-4 mb-4 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign In
          </Link>
        </p>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MiniSIM Security System
        </p>
      </div>
    </div>
  )
}
