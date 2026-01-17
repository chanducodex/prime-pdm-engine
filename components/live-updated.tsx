"use client"

import { useEffect, useState } from "react"
import { Activity } from "lucide-react"

function formatRelative(seconds: number) {
  if (seconds < 5) return "Just now"
  if (seconds < 60) return `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? "day" : "days"} ago`
}

export function LiveUpdated() {
  const [now] = useState(() => new Date())
  const [secondsSince, setSecondsSince] = useState(0)

  useEffect(() => {
    // reference time is when the component mounted (page loaded)
    const started = Date.now()
    const tick = () => {
      setSecondsSince(Math.floor((Date.now() - started) / 1000))
    }

    // initial tick is 0 -> "Just now"
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Activity className="w-4 h-4" />
      <span>Last updated: {formatRelative(secondsSince)}</span>
    </div>
  )
}

export default LiveUpdated
