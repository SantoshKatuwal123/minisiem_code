"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getLogs,
  getAlerts,
  getStatSummary,
  streamChat,
  getSimulationStatus,
  startSimulation,
  stopSimulation,
} from "../app/api/dashboard"
import { useState } from "react"
import { SimulationConfig } from "@/app/type"

export function useLogs(
  params: { skip?: number; limit?: number; token?: string } = {
    skip: 0,
    limit: 10,
  },
) {
  const { skip = 0, limit = 50, token = "" } = params
  return useQuery({
    queryKey: ["logs", skip, limit, token],
    queryFn: () => getLogs({ skip, limit, token }), // ensure getLogs returns a promise
    staleTime: 5000, // fresh for 5 seconds
    refetchInterval: 5000, // refetch every 5 seconds
  })
}

export function useAlerts(
  params: { skip?: number; limit?: number; token?: string } = {
    skip: 0,
    limit: 10,
  },
) {
  const { skip = 0, limit = 20, token = "" } = params
  return useQuery({
    queryKey: ["alerts", skip, limit, token],
    queryFn: () => getAlerts({ skip, limit, token }), // ensure getAlerts returns a promise
    staleTime: 5000, // fresh for 5 seconds
    refetchInterval: 5000, // refetch every 5 seconds
  })
}

export function useStats({ token }: { token: string }) {
  return useQuery({
    queryKey: ["stats", token],
    queryFn: () => getStatSummary({ token }),
    staleTime: 5000, // fresh for 5 seconds
    refetchInterval: 5000, // refetch every 5 seconds
  })
}

export const useAIChat = () => {
  const [streaming, setStreaming] = useState(false)

  const sendMessage = async ({
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
    setStreaming(true)

    try {
      await streamChat({
        token,
        prompt,
        model,
        onChunk,
      })
    } finally {
      setStreaming(false)
    }
  }

  return {
    sendMessage,
    streaming,
  }
}

export function useSimulationStatus({ token }: { token: string }) {
  return useQuery({
    queryKey: ["simulation", "status", token],
    queryFn: () => getSimulationStatus({ token }),
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 0,
    enabled: !!token,
  })
}

export function useStartSimulation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      token,
      config,
    }: {
      token: string
      config?: SimulationConfig
    }) => startSimulation({ token, config }),
    onSuccess: () => {
      // Invalidate and refetch status and logs
      queryClient.invalidateQueries({ queryKey: ["simulation", "status"] })
      queryClient.invalidateQueries({ queryKey: ["simulation", "logs"] })
    },
  })
}

export function useStopSimulation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token }: { token: string }) => stopSimulation({ token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulation", "status"] })
    },
  })
}
