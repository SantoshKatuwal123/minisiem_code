import { json } from "stream/consumers"
import { SimulationConfig } from "../type"

interface entryType {
  skip: number
  limit: number
  token: string
}

export const getLogs = async ({ skip, limit, token }: entryType) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/logs?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch logs")
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching logs:", error)
    throw error
  }
}

export const getAlerts = async ({ skip, limit, token }: entryType) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/alerts?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch logs")
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching logs:", error)
    throw error
  }
}

export const getStatSummary = async ({ token }: { token: string }) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch logs")
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching logs:", error)
    throw error
  }
}

export const streamChat = async ({
  token,
  prompt,
  model,
  onChunk,
}: {
  token: string
  prompt: string
  model: string
  onChunk: (chunk: string) => void
}) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/chat?m=${model}&p=${prompt}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error("Failed to stream chat")
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) return

  while (true) {
    const { done, value } = await reader.read()

    if (done) break

    const chunk = decoder.decode(value)

    onChunk(chunk)
  }
}

// Start simulation
export const startSimulation = async ({
  token,
  config,
}: {
  token: string
  config?: SimulationConfig
}) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/simulation/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config || {}),
      },
    )

    if (!response.ok) {
      throw new Error("Failed to start simulation")
    }

    return response.json()
  } catch (error) {
    console.error("Error starting simulation:", error)
    throw error
  }
}

// Stop simulation
export const stopSimulation = async ({ token }: { token: string }) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/simulation/stop`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to stop simulation")
    }

    return response.json()
  } catch (error) {
    console.error("Error stopping simulation:", error)
    throw error
  }
}

// Get simulation status
export const getSimulationStatus = async ({ token }: { token: string }) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/simulation/status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to get simulation status")
    }

    return response.json()
  } catch (error) {
    console.error("Error getting simulation status:", error)
    throw error
  }
}
