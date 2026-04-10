"use client"

import React from "react"

type LogoutAlertProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

const LogoutAlert = ({ open, onClose, onConfirm }: LogoutAlertProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-[320px] rounded-lg border border-border bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-cardForeground">
          Confirm Logout
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to logout from the system?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          {/* Cancel */}
          <button
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            Cancel
          </button>

          {/* Logout */}
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutAlert
