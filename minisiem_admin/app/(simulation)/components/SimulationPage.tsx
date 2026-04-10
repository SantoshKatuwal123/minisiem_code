"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Play,
  Square,
  Activity,
  Shield,
  Database,
  Clock,
  Server,
  Terminal,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  BarChart3,
  Zap,
  Info,
  X,
  Target,
  Flame,
  ShieldAlert,
  Network,
  Skull,
  Sparkles,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react"

import { SimulationConfig } from "@/app/type"
import {
  useLogs,
  useSimulationStatus,
  useStartSimulation,
  useStopSimulation,
} from "@/hooks/useDashboard"

// ─── Types ────────────────────────────────────────────────────────────────────

type ScenarioId = "mixed" | "bruteforce" | "sql" | "portscan" | "malware"
type LogLevel = "INFO" | "WARNING" | "ERROR" | "CRITICAL"

interface LogEntry {
  id: number
  source_ip: string
  log_type: string
  raw_content: string
  level: LogLevel
  timestamp: string
  normalized_data: Record<string, unknown>
}

interface ScenarioDef {
  id: ScenarioId
  label: string
  description: string
  icon: React.ReactNode
  accent: string
  border: string
  badge: string
  threatLevel: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCENARIOS: ScenarioDef[] = [
  {
    id: "mixed",
    label: "Mixed",
    description: "Realistic blend of normal + attack events",
    icon: <Sparkles size={14} />,
    threatLevel: "LOW",
    accent: "text-emerald-400",
    border: "border-emerald-800",
    badge: "bg-emerald-950 text-emerald-400",
  },
  {
    id: "bruteforce",
    label: "Brute Force",
    description: "Rapid SSH login attempts",
    icon: <Flame size={14} />,
    threatLevel: "MEDIUM",
    accent: "text-orange-400",
    border: "border-orange-800",
    badge: "bg-orange-950 text-orange-400",
  },
  {
    id: "sql",
    label: "SQL Inject",
    description: "Malicious DB queries in HTTP",
    icon: <ShieldAlert size={14} />,
    threatLevel: "HIGH",
    accent: "text-red-400",
    border: "border-red-800",
    badge: "bg-red-950 text-red-400",
  },
  {
    id: "portscan",
    label: "Port Scan",
    description: "Systematic port probing",
    icon: <Network size={14} />,
    threatLevel: "MEDIUM",
    accent: "text-blue-400",
    border: "border-blue-800",
    badge: "bg-blue-950 text-blue-400",
  },
  {
    id: "malware",
    label: "Malware C2",
    description: "C&C server callbacks",
    icon: <Skull size={14} />,
    threatLevel: "CRITICAL",
    accent: "text-purple-400",
    border: "border-purple-800",
    badge: "bg-purple-950 text-purple-400",
  },
]

const LEVEL_STYLES: Record<
  LogLevel,
  { left: string; badge: string; dot: string; bar: string }
> = {
  INFO: {
    left: "border-l-gray-700",
    badge: "bg-gray-800 text-gray-400",
    dot: "bg-gray-500",
    bar: "bg-gray-500",
  },
  WARNING: {
    left: "border-l-yellow-700",
    badge: "bg-yellow-950 text-yellow-400",
    dot: "bg-yellow-500",
    bar: "bg-yellow-500",
  },
  ERROR: {
    left: "border-l-orange-700",
    badge: "bg-orange-950 text-orange-400",
    dot: "bg-orange-500",
    bar: "bg-orange-500",
  },
  CRITICAL: {
    left: "border-l-red-700",
    badge: "bg-red-950 text-red-400",
    dot: "bg-red-500",
    bar: "bg-red-500",
  },
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  linux_auth: <Shield size={11} />,
  apache_access: <Server size={11} />,
  firewall: <ShieldAlert size={11} />,
  network: <Network size={11} />,
}

// ─── Info Modal ───────────────────────────────────────────────────────────────

function InfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-purple-500/20">
              <Zap size={16} className="text-purple-400" />
            </div>
            <span className="font-semibold text-white text-sm">
              Log Simulation Engine
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-400 leading-relaxed">
            Generates synthetic security log data into your SIEM database so you
            can explore dashboards, test alerting rules, and evaluate AI
            analysis — without a live environment.
          </p>
          <div className="grid gap-2">
            {SCENARIOS.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${s.border} bg-gray-950/50`}
              >
                <span className={s.accent}>{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white">
                    {s.label}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {s.description}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${s.badge}`}
                >
                  {s.threatLevel}
                </span>
              </div>
            ))}
          </div>
          <div className="bg-amber-950/40 border border-amber-800 rounded-xl p-3">
            <div className="text-xs font-semibold text-amber-400 mb-1">
              All data is synthetic
            </div>
            <div className="text-[11px] text-amber-600">
              No real systems are targeted or affected by this simulation.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Pulse Dot ────────────────────────────────────────────────────────────────

function PulseDot({ color = "bg-green-500" }: { color?: string }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`}
      />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  )
}

// ─── Log Row ──────────────────────────────────────────────────────────────────

function LogRow({ log }: { log: LogEntry }) {
  const [expanded, setExpanded] = useState(false)
  const level = (log.level ?? "INFO") as LogLevel
  const styles = LEVEL_STYLES[level] ?? LEVEL_STYLES.INFO
  const hasNorm =
    log.normalized_data && Object.keys(log.normalized_data).length > 0

  return (
    <div
      className={`border border-gray-800 border-l-2 ${styles.left} rounded-lg bg-gray-900/60 hover:bg-gray-900 transition-colors`}
    >
      <div className="flex items-start gap-3 p-3">
        <div
          className={`mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[11px] font-mono font-bold text-white">
              {log.source_ip}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${styles.badge}`}
            >
              {level}
            </span>
            <span className="flex items-center gap-1 text-gray-500 text-[10px]">
              {TYPE_ICONS[log.log_type] ?? <Database size={11} />}
              {log.log_type}
            </span>
            <span className="text-[10px] text-gray-600 font-mono ml-auto">
              {log.timestamp
                ? new Date(log.timestamp).toLocaleTimeString()
                : "—"}
            </span>
          </div>
          <p className="text-gray-400 text-[11px] font-mono break-all leading-relaxed">
            {log.raw_content}
          </p>
          {hasNorm && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
            >
              {expanded ? (
                <ChevronDown size={10} />
              ) : (
                <ChevronRight size={10} />
              )}
              Normalized data
            </button>
          )}
          {expanded && hasNorm && (
            <pre className="mt-1.5 p-2 rounded-lg bg-gray-950 text-[10px] text-gray-400 font-mono overflow-x-auto border border-gray-800">
              {JSON.stringify(log.normalized_data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SimulationPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""

  const [showInfo, setShowInfo] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>("mixed")
  const [intervalSec, setIntervalSec] = useState(2)
  const [bruteAttempts, setBruteAttempts] = useState(6)
  const [autoScroll, setAutoScroll] = useState(true)
  const [levelFilter, setLevelFilter] = useState<LogLevel | "ALL">("ALL")
  const [clearedLogs, setClearedLogs] = useState(false)

  const logsEndRef = useRef<HTMLDivElement>(null)

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { data: statusData, refetch: refetchStatus } = useSimulationStatus({
    token,
  })
  const { data: logsData, refetch: refetchLogs } = useLogs({
    skip: 0,
    limit: 10,
    token,
  })
  const startMutation = useStartSimulation()
  const stopMutation = useStopSimulation()

  const isRunning: boolean = statusData?.running ?? false
  const logsGenerated: number = statusData?.stats?.logs_generated ?? 0
  const uptime: number = statusData?.uptime ?? 0
  // Derive logs from API data
  const localLogs = clearedLogs ? [] : ((logsData?.items as LogEntry[]) ?? [])

  // Auto-poll while running
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      refetchLogs()
      refetchStatus()
    }, 2500)
    return () => clearInterval(id)
  }, [isRunning, refetchLogs, refetchStatus])

  // Auto-scroll
  useEffect(() => {
    if (autoScroll) logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [localLogs.length, autoScroll])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const byLevel = localLogs.reduce(
    (acc, l) => {
      acc[l.level] = (acc[l.level] ?? 0) + 1
      return acc
    },
    {} as Record<LogLevel, number>,
  )

  const byType = localLogs.reduce(
    (acc, l) => {
      acc[l.log_type] = (acc[l.log_type] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const filteredLogs =
    levelFilter === "ALL"
      ? localLogs
      : localLogs.filter((l) => l.level === levelFilter)

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleStart() {
    if (!token || startMutation.isPending) return
    const config: SimulationConfig = {
      scenario: selectedScenario,
      interval: intervalSec,
      brute_force_attempts: bruteAttempts,
    }
    startMutation.mutate({ token, config })
  }

  function handleStop() {
    if (!token || stopMutation.isPending) return
    stopMutation.mutate({ token })
  }

  function formatUptime(s: number) {
    if (s < 60) return `${s}s`
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Zap size={18} className="text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white">Log Simulation</h1>
                {isRunning && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 bg-green-950 border border-green-800 px-2 py-0.5 rounded-full">
                    <PulseDot /> LIVE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 font-mono">
                Generate synthetic security events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`hidden sm:flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border font-mono
              ${token ? "border-green-800 bg-green-950/30 text-green-400" : "border-red-800 bg-red-950/30 text-red-400"}`}
            >
              {token ? <Wifi size={12} /> : <WifiOff size={12} />}
              {token ? "Auth OK" : "No token"}
            </div>

            <button
              onClick={() => {
                refetchLogs()
                refetchStatus()
              }}
              className="p-2 rounded-lg border border-gray-800 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>

            <button
              onClick={() => setShowInfo(true)}
              className="p-2 rounded-lg border border-gray-800 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-purple-400 transition-colors"
              title="About"
            >
              <Info size={14} />
            </button>

            {isRunning ? (
              <button
                onClick={handleStop}
                disabled={stopMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-lg shadow-red-900/40"
              >
                <Square size={14} />
                {stopMutation.isPending ? "Stopping…" : "Stop"}
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={startMutation.isPending || !token}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-green-900/40"
              >
                <Play size={14} />
                {startMutation.isPending ? "Starting…" : "Start Simulation"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Error banners */}
      {(startMutation.isError || stopMutation.isError) && (
        <div className="flex-shrink-0 mx-4 mt-3 p-3 rounded-xl bg-red-950 border border-red-800 text-sm text-red-400">
          {startMutation.isError
            ? "Failed to start simulation. Check your connection."
            : "Failed to stop simulation."}
        </div>
      )}

      {/* Body */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-4 h-full flex gap-4">
          {/* Left panel */}
          <div className="w-64 xl:w-72 flex-shrink-0 flex flex-col gap-3 overflow-y-auto">
            {/* Status card */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-purple-400" />
                  <span className="text-xs font-semibold text-white">
                    Status
                  </span>
                </div>
                <PulseDot color={isRunning ? "bg-green-500" : "bg-gray-600"} />
              </div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-gray-500">State</span>
                <span
                  className={`font-mono font-bold ${isRunning ? "text-green-400" : "text-gray-500"}`}
                >
                  {isRunning ? "ACTIVE" : "IDLE"}
                </span>
              </div>
              {isRunning && (
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-800">
                  <div className="text-center p-2 rounded-lg bg-gray-950">
                    <div className="text-sm font-bold font-mono text-white">
                      {logsGenerated.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">logs</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gray-950">
                    <div className="text-sm font-bold font-mono text-white">
                      {formatUptime(uptime)}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      uptime
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scenario picker */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} className="text-blue-400" />
                <span className="text-xs font-semibold text-white">
                  Scenario
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {SCENARIOS.map((s) => {
                  const sel = selectedScenario === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => !isRunning && setSelectedScenario(s.id)}
                      disabled={isRunning}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all text-left
                        ${sel ? `${s.border} bg-gray-950` : "border-gray-800 hover:border-gray-700"}
                        ${isRunning ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className={sel ? s.accent : "text-gray-600"}>
                        {s.icon}
                      </span>
                      <span
                        className={`text-xs font-medium flex-1 ${sel ? "text-white" : "text-gray-400"}`}
                      >
                        {s.label}
                      </span>
                      {sel && (
                        <CheckCircle size={11} className="text-green-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Settings */}
            <div
              className={`rounded-xl border border-gray-800 bg-gray-900/50 p-4 transition-opacity ${isRunning ? "opacity-40 pointer-events-none" : ""}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-xs font-semibold text-white">
                    Settings
                  </span>
                </div>
                {isRunning && (
                  <span className="text-[10px] text-gray-600">Locked</span>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500">Interval</span>
                    <span className="font-mono text-white">
                      {intervalSec.toFixed(1)}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={intervalSec}
                    onChange={(e) => setIntervalSec(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-gray-600">
                    <span>0.5s fast</span>
                    <span>10s slow</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500">Brute attempts</span>
                    <span className="font-mono text-white">
                      {bruteAttempts}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={20}
                    step={1}
                    value={bruteAttempts}
                    onChange={(e) => setBruteAttempts(parseInt(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-gray-600">
                    <span>2 quiet</span>
                    <span>20 aggressive</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={14} className="text-blue-400" />
                <span className="text-xs font-semibold text-white">
                  Statistics
                </span>
                <span className="ml-auto text-[10px] font-mono text-gray-500">
                  {localLogs.length} total
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">
                    By severity
                  </div>
                  {(["CRITICAL", "ERROR", "WARNING", "INFO"] as LogLevel[]).map(
                    (lvl) => {
                      const cnt = byLevel[lvl] ?? 0
                      const pct = localLogs.length
                        ? Math.round((cnt / localLogs.length) * 100)
                        : 0
                      const s = LEVEL_STYLES[lvl]
                      return (
                        <div
                          key={lvl}
                          className="flex items-center gap-2 mb-1.5"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`}
                          />
                          <span className="text-[11px] text-gray-500 w-16">
                            {lvl}
                          </span>
                          <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${s.bar} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-gray-400 w-5 text-right">
                            {cnt}
                          </span>
                        </div>
                      )
                    },
                  )}
                </div>
                {Object.keys(byType).length > 0 && (
                  <div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">
                      By type
                    </div>
                    {Object.entries(byType).map(([type, cnt]) => (
                      <div
                        key={type}
                        className="flex justify-between text-[11px] py-0.5"
                      >
                        <span className="text-gray-500 font-mono">{type}</span>
                        <span className="text-gray-400 font-mono">{cnt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3 space-y-2">
              <button
                onClick={() => {
                  refetchLogs()
                  refetchStatus()
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-gray-400 border border-gray-800 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <RefreshCw size={12} /> Refresh
              </button>
              <button
                onClick={() => setClearedLogs(true)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-red-500 border border-red-900 hover:bg-red-950/50 transition-colors"
              >
                <Trash2 size={12} /> Clear display
              </button>
              <label className="flex items-center justify-between px-1 py-1 cursor-pointer">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  {autoScroll ? <Eye size={12} /> : <EyeOff size={12} />}{" "}
                  Auto-scroll
                </span>
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="accent-purple-500 w-3.5 h-3.5 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Right panel — log stream */}
          <div className="flex-1 flex flex-col min-w-0 rounded-xl border border-gray-800 bg-gray-900/30 overflow-hidden">
            {/* Stream header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-950/60">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-green-400" />
                <span className="text-xs font-semibold text-white">
                  Live Log Stream
                </span>
                {isRunning && (
                  <span className="flex items-center gap-1.5 text-[10px] text-green-400 font-mono">
                    <PulseDot /> RECORDING
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Filter size={11} className="text-gray-600 mr-1" />
                {(["ALL", "CRITICAL", "ERROR", "WARNING", "INFO"] as const).map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setLevelFilter(f)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors
                      ${levelFilter === f ? "bg-purple-600 text-white" : "text-gray-600 hover:text-gray-400"}`}
                    >
                      {f}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Entries */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                    <Database size={22} className="opacity-40" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">No logs to display</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {isRunning
                        ? "Waiting for first events…"
                        : "Start simulation to see events"}
                    </p>
                  </div>
                  {!isRunning && (
                    <button
                      onClick={handleStart}
                      disabled={!token}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold transition-all"
                    >
                      <Play size={12} /> Start simulation
                    </button>
                  )}
                </div>
              ) : (
                filteredLogs.map((log) => <LogRow key={log.id} log={log} />)
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-t border-gray-800 bg-gray-950/60">
              <span className="text-[10px] font-mono text-gray-600">
                {filteredLogs.length} / {localLogs.length} entries shown
              </span>
              <span className="text-[10px] text-gray-700">
                All data is synthetic · no real systems affected
              </span>
            </div>
          </div>
        </div>
      </main>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  )
}
