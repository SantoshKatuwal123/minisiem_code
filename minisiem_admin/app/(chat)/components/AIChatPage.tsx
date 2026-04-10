"use client"
import React, { useState, useRef, useEffect } from "react"
import { Send, User, ShieldCheck, Terminal, AlertCircle } from "lucide-react"
import { useAIChat } from "@/hooks/useDashboard"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ModelDetails {
  parent_model: string
  format: string
  family: string
  families: string[]
  parameter_size: string
  quantization_level: string
}

interface OllamaModel {
  name: string
  model: string
  modified_at: string
  size: number
  digest: string
  details: ModelDetails
}

export default function AIChatPage() {
  const { sendMessage, streaming } = useAIChat()

  const [models, setModels] = useState<OllamaModel[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "MiniSIEM AI Online. Please select a model to begin analysis.",
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""

  const getLLamaList = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:11434/api/tags")
      if (!response.ok) throw new Error("Ollama not responding")
      const data = await response.json()
      const fetchedModels = data.models || []
      setModels(fetchedModels)

      // Auto-select the first model if available
      if (fetchedModels.length > 0) {
        setSelectedModel(fetchedModels[0].name)
      }
    } catch (err: unknown) {
      setError("No models found. Please ensure Ollama is running.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getLLamaList()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !selectedModel || streaming) return

    const prompt = input
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    }
    const assistantId = (Date.now() + 1).toString()

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      },
    ])
    setInput("")

    let streamed = ""
    await sendMessage({
      token,
      prompt,
      model: selectedModel, // Using selected model here
      onChunk: (chunk) => {
        streamed += chunk
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: streamed } : m,
          ),
        )
      },
    })
  }

  // Determine if the chat should be disabled
  const isChatDisabled = models.length === 0 || !!error

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950 font-sans transition-colors duration-300">
      {/* Header code stays the same... */}

      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 md:px-6"
      >
        <div className="space-y-10 py-10">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 md:gap-6 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <ShieldCheck size={20} className="text-green-500" />
                </div>
              )}
              <div
                className={`group flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed markdown-container ${
                    msg.role === "user"
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "text-gray-800 dark:text-gray-200 border-l-2 border-green-500/30 bg-green-500/[0.02]"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <span className="text-[10px] text-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity font-mono uppercase">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
              {msg.role === "user" && (
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={18} className="text-gray-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
        {/* Model Selector and Error State */}
        <div className="mb-3 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Model:
            </span>
            {models.length > 0 ? (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs font-semibold text-green-500 outline-none cursor-pointer hover:underline"
              >
                {models.map((m) => (
                  <option
                    key={m.digest}
                    value={m.name}
                    className="bg-white dark:bg-gray-900"
                  >
                    {m.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-semibold text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> No models found
              </span>
            )}
          </div>
          {loading && (
            <span className="text-[10px] text-green-500 animate-pulse font-mono">
              Syncing Ollama...
            </span>
          )}
        </div>

        {/* Input Bar */}
        <div
          className={`relative flex items-end gap-2 bg-white dark:bg-gray-950 border rounded-2xl p-2 pl-4 shadow-sm transition-all ${
            isChatDisabled
              ? "border-red-500/50 bg-red-500/[0.02] opacity-70"
              : "border-gray-200 dark:border-gray-800 focus-within:border-green-500/50"
          }`}
        >
          <textarea
            rows={1}
            value={input}
            disabled={isChatDisabled}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={
              isChatDisabled
                ? "Chat disabled: No models available"
                : "Ask MiniSIEM AI..."
            }
            className="w-full py-3 bg-transparent border-none focus:ring-0 resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 max-h-40 outline-none text-sm disabled:cursor-not-allowed"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || streaming || isChatDisabled}
            className={`p-3 rounded-xl transition-all ${
              input.trim() && !isChatDisabled
                ? "bg-green-600 text-white shadow-lg hover:bg-green-500"
                : "text-gray-400 bg-transparent opacity-50 cursor-not-allowed"
            }`}
          >
            <Send size={18} />
          </button>
        </div>

        <div className="flex justify-center items-center gap-4 mt-4">
          <p className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-widest font-semibold">
            <Terminal size={10} /> MiniSIEM AI - {selectedModel || "OFFLINE"}
          </p>
        </div>
      </footer>
    </div>
  )
}
