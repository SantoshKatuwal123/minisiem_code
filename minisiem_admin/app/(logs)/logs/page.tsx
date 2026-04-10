"use client"

import { format, formatDistanceToNow } from "date-fns"
import { Server, TerminalSquare } from "lucide-react"
import { Log } from "@/app/type"
import LogSkeleton from "./components/LogSkeleton"
import { useLogs } from "@/hooks/useDashboard"
import { Pagination } from "@/components/Pagination"
import { useState } from "react"
export default function LogsPage() {
  const [skip, setSkip] = useState(0)
  const [limit, setLimit] = useState(20)

  const AUTH_TOKEN = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""

  const { data, isLoading } = useLogs({ skip, limit, token: AUTH_TOKEN })

  const logs = data?.items || []
  const totalCount = data?.total || 0
  if (isLoading) {
    return <LogSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TerminalSquare className="w-6 h-6 text-gray-500" />
            System Logs
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({totalCount})
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor system log activity in real-time.
          </p>
        </div>

        {/* Logs List */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {logs.map((log: Log, index: number) => (
              <li
                key={log.id || index}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  {/* Log Type */}
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    {log.log_type}
                  </span>

                  {/* Time */}
                  <span
                    className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"
                    title={format(new Date(log.timestamp), "PPP p")}
                  >
                    ⏱{" "}
                    {formatDistanceToNow(new Date(log.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {/* Log Content */}
                <code className="block text-xs text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-gray-950 p-3 rounded-md border border-gray-100 dark:border-gray-800 break-all overflow-hidden line-clamp-3 font-mono">
                  {log.raw_content}
                </code>

                {/* Footer */}
                <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400 gap-4">
                  <span className="flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    {log.source_ip}
                  </span>
                  <span>ID: #{log.id}</span>
                </div>
              </li>
            ))}

            {logs.length != 0 && (
              <Pagination
                skip={skip}
                limit={limit}
                totalCount={totalCount}
                onPageChange={(newSkip) => setSkip(newSkip)}
              />
            )}

            {logs.length === 0 && (
              <li className="p-8 text-center text-gray-500">No logs found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
