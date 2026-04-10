export interface Log {
  id: string | number
  log_type: string
  level: string
  raw_content: string
  source_ip: string
  timestamp: string
}

export interface Alert {
  id: string | number
  rule_name: string
  severity: string
  message: string
  source_ip: string
  timestamp: string
}

export interface Login {
  email: string
  password: string
}

export interface Register {
  id: string | number | null
  fullname: string
  email: string
  password: string
  token: string | null
}

export interface KPIs {
  total_alerts: number
  critical_alerts: number
  unique_attackers: number
  total_logs: number
  failed_logins: number
  successful_logins: number
}
export interface AlertByType {
  type: string
  count: number
}
export interface AlertOverTime {
  time: string
  count: number
}

export interface TopAttacker {
  ip: string
  count: number
}

export interface RecentAlert {
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
export interface StatusCode {
  status: string
  count: number
}
export interface TopEndpoint {
  endpoint: string
  count: number
}
export interface DashboardData {
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

export interface SimulationConfig {
  scenario: string
  interval: number
  brute_force_attempts: number
  auto_stop?: number
}

export interface SimulationStatus {
  success: boolean
  running: boolean
  scenario: string
  stats: {
    logs_generated: number
    start_time: string | null
    scenario: string
  }
  uptime: number
}

export interface LogEntry {
  id: number
  source_ip: string
  log_type: string
  raw_content: string
  level: string
  timestamp: string
  normalized_data: Record<string, unknown>
}

export interface LogListResponse {
  success: boolean
  total: number
  items: LogEntry[]
  error?: string
}
