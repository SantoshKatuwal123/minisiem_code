"use client"
import React from "react"
import DashboardPage from "./components/DashboardPage"
import { useStats } from "@/hooks/useDashboard"

const Page = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : ""
  const { data } = useStats({ token })
  return (
    <div>
      <DashboardPage data={data} />
    </div>
  )
}

export default Page
