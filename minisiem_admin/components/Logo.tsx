import React from "react"

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      {/* Icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10 text-green-500 text-2xl font-bold">
        🛡️
      </div>

      {/* Text */}
      <div className="flex flex-col leading-tight">
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          Mini<span className="text-green-400">SIEM</span>
        </h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Security Monitor
        </p>
      </div>
    </div>
  )
}

export default Logo
