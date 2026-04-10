"use client"

import { useEffect, useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

type Theme = "light" | "dark" | "system"

const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: "light", icon: <Sun className="h-4 w-4" />, label: "Light" },
  { value: "dark", icon: <Moon className="h-4 w-4" />, label: "Dark" },
  { value: "system", icon: <Monitor className="h-4 w-4" />, label: "System" },
]

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system")

  useEffect(() => {
    const root = window.document.documentElement
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    root.classList.toggle(
      "dark",
      theme === "dark" || (theme === "system" && systemDark),
    )
  }, [theme])

  return (
    <div className="inline-flex items-center rounded-full bg-muted p-1">
      {options.map(({ value, icon, label }) => {
        const active = theme === value
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={label}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-cardForeground",
            )}
          >
            {icon}
            {active && <span>{label}</span>}
          </button>
        )
      })}
    </div>
  )
}
