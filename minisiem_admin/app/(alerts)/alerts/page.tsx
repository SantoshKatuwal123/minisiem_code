"use client"

import { useAlerts } from "@/hooks/useDashboard"
import { format, formatDistanceToNow } from "date-fns"
import { ShieldAlert, Server } from "lucide-react"
import { Alert } from "@/app/type"
import AlertSkeleton from "./components/AlertSkeleton"
import { Pagination } from "@/components/Pagination"
import { useEffect, useState } from "react"
import { requireAuth } from "@/app/utils/AuthValidator"

export default function AlertsPage() {
  useEffect(() => {
    requireAuth()
  }, [])

  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(20)

  const AUTH_TOKEN = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""

  const { data = [], isLoading } = useAlerts({ skip, limit, token: AUTH_TOKEN })

  const alerts = data?.items || []
  const totalCount = data?.total || 0

  if (isLoading) {
    return <AlertSkeleton />
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            CRITICAL
          </span>
        )
      case "WARNING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            WARNING
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            {severity}
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Security Alerts{" "}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({totalCount})
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor detected threats and suspicious activities.
          </p>
        </div>

        {/* Alerts List */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {alerts &&
              alerts.map((alert: Alert, index: number) => (
                <li
                  key={alert.id || index}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <div className="flex justify-between items-start mb-1">
                    {/* Rule Name */}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {alert.rule_name}
                    </span>

                    {/* Severity */}
                    {getSeverityBadge(alert.severity)}

                    {/* Time */}
                    <span
                      className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"
                      title={format(new Date(alert.timestamp), "PPP p")}
                    >
                      ⏱{" "}
                      {formatDistanceToNow(new Date(alert.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {/* Alert Message */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {alert.message}
                  </p>

                  {/* Footer */}
                  <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400 gap-4">
                    <span className="flex items-center gap-1">
                      <Server className="w-3 h-3" />
                      {alert.source_ip}
                    </span>
                    <span>ID: #{alert.id}</span>
                  </div>
                </li>
              ))}

            {alerts.length != 0 && (
              <Pagination
                skip={skip}
                limit={limit}
                totalCount={totalCount}
                onPageChange={(newSkip) => setSkip(newSkip)}
              />
            )}

            {alerts.length === 0 && (
              <li className="p-8 text-center text-gray-500">
                No alerts detected.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
