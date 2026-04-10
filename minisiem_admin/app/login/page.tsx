"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/components/Logo"
import Link from "next/link"
import { useLogin } from "@/hooks/useAuth"
import { Eye, EyeOff } from "lucide-react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [viewPassword, setViewPassword] = useState(false)

  const loginMutation = useLogin()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    loginMutation.mutate({ email, password })
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
        {loginMutation.isError && (
          <p className="text-red-500 bg-red-200 rounded-md p-2">
            {loginMutation.error.message || "Login failed"}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@minisim.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>

            <div className="relative">
              <input
                type={viewPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                type="button"
                onClick={() => setViewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {viewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Signup redirect */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MiniSIM Security System
        </p>
      </div>
    </div>
  )
}
