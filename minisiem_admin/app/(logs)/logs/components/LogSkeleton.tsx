import React from "react"

const LogSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3"
            >
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>

              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>

              <div className="flex gap-4">
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LogSkeleton
