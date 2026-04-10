import React from "react"
import SimulationPage from "../components/SimulationPage"

const page = () => {
  return (
    <div>
      <SimulationPage />
    </div>
  )
}

export default page

// Example API call with configuration
// await fetch("/api/simulation/start", {
//   method: "POST",
//   headers: {
//     "Authorization": `Bearer ${token}`,
//     "Content-Type": "application/json"
//   },
//   body: JSON.stringify({
//     scenario: "bruteforce",
//     interval: 1.5,
//     brute_force_attempts: 10,
//     auto_stop: 60  // Stop after 60 seconds
//   })
// })
