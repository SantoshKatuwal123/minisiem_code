import { useMutation } from "@tanstack/react-query"
import { login, register } from "@/app/api/auth"
import { useRouter } from "next/navigation"
import { Login, Register } from "@/app/type"

export function useLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: Login) => login(data),
    onSuccess: (data) => {
      // Store token and user info in localStorage
      localStorage.setItem("token", data.data.token)
      localStorage.setItem("user", JSON.stringify(data.data.user))

      // Redirect to dashboard or protected page
      router.push("/dashboard")
    },
    onError: (error) => {
      console.error("Login error:", error)
    },
  })
}

export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: Omit<Register, "id" | "token">) => register(data),
    onSuccess: (data) => {
      // Redirect to login
      setTimeout(() => {
        router.push("/login")
      }, 1000)
    },
    onError: (error) => {
      console.error("Registration error:", error)
    },
  })
}
