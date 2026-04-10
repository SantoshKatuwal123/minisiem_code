"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  skip: number
  limit: number
  totalCount: number
  onPageChange: (newSkip: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
  skip,
  limit,
  totalCount,
  onPageChange,
}) => {
  const currentPage = Math.floor(skip / limit) + 1
  const totalPages = Math.ceil(totalCount / limit)

  if (totalPages <= 1) return null

  const getPages = () => {
    const pages = []
    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      {/* Previous Button */}
      <button
        className={cn(
          "px-3 py-1 rounded-md text-sm font-medium",
          currentPage === 1
            ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
            : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
        )}
        disabled={currentPage === 1}
        onClick={() => onPageChange(skip - limit)}
      >
        Previous
      </button>

      {/* Page Numbers */}
      {getPages().map((page) => {
        const pageSkip = (page - 1) * limit
        return (
          <button
            key={page}
            className={cn(
              "px-3 py-1 rounded-md text-sm font-medium",
              page === currentPage
                ? "bg-blue-600 text-white dark:bg-blue-500"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
            )}
            onClick={() => onPageChange(pageSkip)}
          >
            {page}
          </button>
        )
      })}

      {/* Next Button */}
      <button
        className={cn(
          "px-3 py-1 rounded-md text-sm font-medium",
          currentPage === totalPages
            ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
            : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors",
        )}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(skip + limit)}
      >
        Next
      </button>
    </div>
  )
}
