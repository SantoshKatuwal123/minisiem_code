"use client"
import React, { useMemo } from "react"
import { format, formatDistanceToNow } from "date-fns"
import {
  ShieldAlert,
  Activity,
  TerminalSquare,
  AlertTriangle,
  Server,
  Shield,
  CheckCircle,
  Clock,
  BarChart2,
  Users,
  LogIn,
  LogOut,
  Globe,
  Layers,
} from "lucide-react"
import Link from "next/link"

// ─── Types matching the new API response format ──────────────────────────────

interface KPIs {
  total_alerts: number
  critical_alerts: number
  unique_attackers: number
  total_logs: number
  failed_logins: number
  successful_logins: number
}

interface AlertByType {
  type: string
  count: number
}

interface AlertOverTime {
  time: string
  count: number
}

interface TopAttacker {
  ip: string
  count: number
}

interface RecentAlert {
  id: number
  rule: string
  severity: string
  ip: string
  time: string
}

interface LoginActivity {
  time: string
  event: "failed_login" | "successful_login"
  count: number
}

interface StatusCode {
  status: string
  count: number
}

interface TopEndpoint {
  endpoint: string
  count: number
}

interface DashboardData {
  success: boolean
  kpis: KPIs
  alerts: {
    by_type: AlertByType[]
    over_time: AlertOverTime[]
    top_attackers: TopAttacker[]
    recent: RecentAlert[]
  }
  logs: {
    login_activity: LoginActivity[]
    status_codes: StatusCode[]
    top_endpoints: TopEndpoint[]
  }
}

// ─── Hooks (replace with your actual hook ─────────────────────────────────────
// import { useDashboard } from "@/hooks/useDashboard"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  string,
  { bg: string; text: string; ring: string; label: string }
> = {
  CRITICAL: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    ring: "ring-red-200 dark:ring-red-800",
    label: "CRITICAL",
  },
  HIGH: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    ring: "ring-orange-200 dark:ring-orange-800",
    label: "HIGH",
  },
  WARNING: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    ring: "ring-amber-200 dark:ring-amber-800",
    label: "WARNING",
  },
  INFO: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    ring: "ring-blue-200 dark:ring-blue-800",
    label: "INFO",
  },
}

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = SEVERITY_CONFIG[severity?.toUpperCase()] ?? {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    ring: "ring-gray-200 dark:ring-gray-700",
    label: severity,
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}
    >
      {cfg.label}
    </span>
  )
}

const BAR_COLORS = [
  "bg-red-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-teal-500",
  "bg-emerald-500",
]

function MiniBar({
  value,
  max,
  colorClass,
}: {
  value: number
  max: number
  colorClass: string
}) {
  const pct = Math.max((value / max) * 100, 2)
  return (
    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: number | string
  sub?: string
  subColor?: string
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  subColor,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm flex flex-col gap-2">
      <div className={`inline-flex p-2 rounded-lg w-fit ${iconBg}`}>{icon}</div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
        {value}
      </p>
      {sub && (
        <p
          className={`text-xs font-medium ${subColor ?? "text-gray-400 dark:text-gray-500"}`}
        >
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── Mini donut ───────────────────────────────────────────────────────────────

function Donut({ failed, success }: { failed: number; success: number }) {
  const total = failed + success || 1
  const r = 22
  const circ = 2 * Math.PI * r
  const failedPct = (failed / total) * circ
  const successPct = (success / total) * circ
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      {/* track */}
      <circle
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        className="text-gray-100 dark:text-gray-800"
      />
      {/* success arc */}
      <circle
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeDasharray={`${successPct} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        className="text-emerald-500"
      />
      {/* failed arc */}
      <circle
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeDasharray={`${failedPct} ${circ}`}
        strokeDashoffset={circ * 0.25 - successPct}
        strokeLinecap="round"
        className="text-red-500"
      />
    </svg>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  note,
  href,
}: {
  icon: React.ReactNode
  title: string
  note?: string
  href?: string
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {note && <span className="text-xs text-gray-400">{note}</span>}
      </div>
      {href && (
        <Link
          href={href}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          View all
        </Link>
      )}
    </div>
  )
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DashboardPageProps {
  data: DashboardData
}

export default function DashboardPage({ data }: DashboardPageProps) {
  // Fallback shapes
  const kpis = data?.kpis ?? {
    total_alerts: 0,
    critical_alerts: 0,
    unique_attackers: 0,
    total_logs: 0,
    failed_logins: 0,
    successful_logins: 0,
  }
  const alertsData = data?.alerts ?? {
    by_type: [],
    over_time: [],
    top_attackers: [],
    recent: [],
  }
  const logsData = data?.logs ?? {
    login_activity: [],
    status_codes: [],
    top_endpoints: [],
  }

  // ── Derived ──
  const overTimeCounts = useMemo(
    () => alertsData.over_time.map((o) => o.count),
    [alertsData.over_time],
  )

  const maxAttackerCount = useMemo(
    () => Math.max(...alertsData.top_attackers.map((a) => a.count), 1),
    [alertsData.top_attackers],
  )

  const maxAlertTypeCount = useMemo(
    () => Math.max(...alertsData.by_type.map((a) => a.count), 1),
    [alertsData.by_type],
  )

  const maxEndpointCount = useMemo(
    () => Math.max(...logsData.top_endpoints.map((e) => e.count), 1),
    [logsData.top_endpoints],
  )

  const loginRatio = kpis.failed_logins + kpis.successful_logins || 1
  const failedPct = Math.round((kpis.failed_logins / loginRatio) * 100)
  const successPct = 100 - failedPct

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-screen-xl mx-auto space-y-6">
        {/* ── Top Bar ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200 dark:border-gray-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300 shrink-0" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                Security Operations Center
              </h1>
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 pl-7">
              Live threat monitoring dashboard
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {kpis.total_alerts > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800">
                <ShieldAlert className="w-3 h-3" /> {kpis.total_alerts} alerts
              </span>
            )}
            {kpis.total_logs > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800">
                <Activity className="w-3 h-3" /> {kpis.total_logs} logs
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-800">
              <CheckCircle className="w-3 h-3" /> System live
            </span>
          </div>
        </div>

        {/* ── KPI Grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            icon={
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
            }
            iconBg="bg-red-100 dark:bg-red-900/30"
            label="Total Alerts"
            value={kpis.total_alerts}
          />
          <StatCard
            icon={
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            }
            iconBg="bg-orange-100 dark:bg-orange-900/30"
            label="Critical"
            value={kpis.critical_alerts}
            sub={`${kpis.total_alerts > 0 ? Math.round((kpis.critical_alerts / kpis.total_alerts) * 100) : 0}% of total`}
            subColor="text-orange-500"
          />
          <StatCard
            icon={
              <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            }
            iconBg="bg-violet-100 dark:bg-violet-900/30"
            label="Unique Attackers"
            value={kpis.unique_attackers}
          />
          <StatCard
            icon={
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            }
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            label="Total Logs"
            value={kpis.total_logs}
          />
          <StatCard
            icon={<LogOut className="w-4 h-4 text-red-500" />}
            iconBg="bg-red-100 dark:bg-red-900/30"
            label="Failed Logins"
            value={kpis.failed_logins}
            sub={`${failedPct}% fail rate`}
            subColor="text-red-500"
          />
          <StatCard
            icon={
              <LogIn className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            }
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
            label="Successful Logins"
            value={kpis.successful_logins}
            sub={`${successPct}% success rate`}
            subColor="text-emerald-500"
          />
        </div>

        {/* ── Middle row: Alerts over time + Login ratio ─────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Alerts over time sparkline */}
          <Card className="p-5 col-span-1 lg:col-span-2">
            <SectionHeader
              icon={<BarChart2 className="w-4 h-4 text-gray-400" />}
              title="Alert volume over time"
            />
            {overTimeCounts.length > 0 ? (
              <div className="w-full overflow-hidden">
                {/* Inline responsive bar chart */}
                <div className="flex items-end gap-[3px] h-24 w-full">
                  {alertsData.over_time.map((point, i) => {
                    const max = Math.max(...overTimeCounts, 1)
                    const h = Math.max((point.count / max) * 100, 4)
                    return (
                      <div
                        key={i}
                        className="flex-1 relative group"
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "flex-end",
                        }}
                      >
                        <div
                          className="w-full bg-blue-500/80 hover:bg-blue-500 rounded-t transition-colors"
                          style={{ height: `${h}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-10">
                          <div className="bg-gray-900 text-white text-[10px] font-medium rounded px-1.5 py-0.5 whitespace-nowrap shadow">
                            {point.count} at {point.time.slice(11)}
                          </div>
                          <div className="w-0 h-0 border-x-[4px] border-x-transparent border-t-[4px] border-t-gray-900" />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-gray-400 dark:text-gray-500">
                  <span>{alertsData.over_time[0]?.time.slice(11)}</span>
                  <span>
                    {alertsData.over_time[
                      Math.floor(alertsData.over_time.length / 2)
                    ]?.time.slice(11)}
                  </span>
                  <span>
                    {alertsData.over_time[
                      alertsData.over_time.length - 1
                    ]?.time.slice(11)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No data available</p>
            )}
          </Card>

          {/* Login ratio donut */}
          <Card className="p-5">
            <SectionHeader
              icon={<LogIn className="w-4 h-4 text-gray-400" />}
              title="Login activity"
            />
            <div className="flex items-center gap-5">
              <Donut
                failed={kpis.failed_logins}
                success={kpis.successful_logins}
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Success
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white ml-auto pl-4">
                    {kpis.successful_logins}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Failed
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white ml-auto pl-4">
                    {kpis.failed_logins}
                  </span>
                </div>
                <div className="mt-1 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                  {failedPct}% fail rate
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Alert breakdown + Attacker table ───────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Alert types */}
          <Card className="p-5">
            <SectionHeader
              icon={<Layers className="w-4 h-4 text-gray-400" />}
              title="Alert types"
            />
            {alertsData.by_type.length === 0 ? (
              <p className="text-sm text-gray-400">No data</p>
            ) : (
              <div className="space-y-3">
                {alertsData.by_type.map((item, i) => (
                  <div key={item.type} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-1 min-w-0 truncate">
                      {item.type}
                    </span>
                    <MiniBar
                      value={item.count}
                      max={maxAlertTypeCount}
                      colorClass={BAR_COLORS[i % BAR_COLORS.length]}
                    />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-8 text-right shrink-0">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Top attackers */}
          <Card className="p-5">
            <SectionHeader
              icon={<Server className="w-4 h-4 text-gray-400" />}
              title="Top attackers"
            />
            {alertsData.top_attackers.length === 0 ? (
              <p className="text-sm text-gray-400">No data</p>
            ) : (
              <div className="space-y-3">
                {alertsData.top_attackers.map((attacker, i) => (
                  <div key={attacker.ip} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-700 dark:text-gray-300 w-32 shrink-0">
                      {attacker.ip}
                    </span>
                    <MiniBar
                      value={attacker.count}
                      max={maxAttackerCount}
                      colorClass={BAR_COLORS[i % BAR_COLORS.length]}
                    />
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400 w-16 text-right shrink-0">
                      {attacker.count} hits
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Top endpoints */}
          <Card className="p-5">
            <SectionHeader
              icon={<Globe className="w-4 h-4 text-gray-400" />}
              title="Top endpoints"
            />
            {logsData.top_endpoints.length === 0 ? (
              <p className="text-sm text-gray-400">No data</p>
            ) : (
              <div className="space-y-3">
                {logsData.top_endpoints.map((ep, i) => (
                  <div key={ep.endpoint} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono text-gray-600 dark:text-gray-400 min-w-0 truncate">
                        {ep.endpoint}
                      </span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                        {ep.count}
                      </span>
                    </div>
                    <MiniBar
                      value={ep.count}
                      max={maxEndpointCount}
                      colorClass={BAR_COLORS[i % BAR_COLORS.length]}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── Recent alerts ──────────────────────────────────────────────── */}
        <div>
          <SectionHeader
            icon={<ShieldAlert className="w-4 h-4 text-red-500" />}
            title="Recent alerts"
            href="/alerts"
          />
          <Card className="overflow-hidden">
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
                    <th className="text-left px-4 py-2.5 text-gray-500 dark:text-gray-400 font-medium">
                      ID
                    </th>
                    <th className="text-left px-4 py-2.5 text-gray-500 dark:text-gray-400 font-medium">
                      Rule
                    </th>
                    <th className="text-left px-4 py-2.5 text-gray-500 dark:text-gray-400 font-medium">
                      Severity
                    </th>
                    <th className="text-left px-4 py-2.5 text-gray-500 dark:text-gray-400 font-medium">
                      Source IP
                    </th>
                    <th className="text-left px-4 py-2.5 text-gray-500 dark:text-gray-400 font-medium">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {alertsData.recent.map((alert) => (
                    <tr
                      key={alert.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-gray-400 dark:text-gray-500">
                        #{alert.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {alert.rule}
                      </td>
                      <td className="px-4 py-3">
                        <SeverityBadge severity={alert.severity} />
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">
                        {alert.ip}
                      </td>
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        <span
                          className="flex items-center gap-1"
                          title={format(new Date(alert.time), "PPP p")}
                        >
                          <Clock className="w-3 h-3 shrink-0" />
                          {formatDistanceToNow(new Date(alert.time), {
                            addSuffix: true,
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {alertsData.recent.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-400"
                      >
                        No recent alerts
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {alertsData.recent.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white flex-1 min-w-0">
                      {alert.rule}
                    </span>
                    <SeverityBadge severity={alert.severity} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-mono flex items-center gap-1">
                      <Server className="w-3 h-3" /> {alert.ip}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(alert.time), {
                        addSuffix: true,
                      })}
                    </span>
                    <span className="ml-auto text-gray-400">#{alert.id}</span>
                  </div>
                </div>
              ))}
              {alertsData.recent.length === 0 && (
                <p className="p-8 text-center text-sm text-gray-400">
                  No recent alerts
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* ── HTTP status codes ──────────────────────────────────────────── */}
        {logsData.status_codes.length > 0 && (
          <div>
            <SectionHeader
              icon={<Activity className="w-4 h-4 text-gray-400" />}
              title="HTTP status codes"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {logsData.status_codes.map((sc) => {
                const isOk = sc.status.startsWith("2")
                const isWarn =
                  sc.status.startsWith("3") || sc.status.startsWith("4")
                const colorClass = isOk
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isWarn
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400"
                return (
                  <div
                    key={sc.status}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm text-center"
                  >
                    <p
                      className={`text-2xl font-bold leading-none ${colorClass}`}
                    >
                      {sc.status}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {sc.count} requests
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
