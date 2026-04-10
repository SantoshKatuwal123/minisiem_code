import { Login, Register } from "../type"

export const login = async ({ email, password }: Login) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      },
    )

    const data = await response.json()

    // Handle backend failure response
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Login failed")
    }

    return data
  } catch (error) {
    console.error("Error during login:", error)
    throw error
  }
}

export const register = async ({
  fullname,
  email,
  password,
}: Omit<Register, "id" | "token">) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullname, email, password }),
      },
    )
    const data = await response.json()
    // Handle backend failure response
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Registration failed")
    }

    return data
  } catch (error) {
    console.error("Error during registration:", error)
    throw error
  }
}
