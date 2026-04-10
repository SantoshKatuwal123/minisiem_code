// this will check if the user is authenticated by looking for a token in localStorage

export function requireAuth() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (!token || !user) {
      // Redirect to login
      window.location.href = "/login"
      return null
    }
  }
}
