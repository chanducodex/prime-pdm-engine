"use client"

import { useEffect } from "react"

export function OpenReplayTracker() {
  useEffect(() => {
    // Only load tracker in production or when explicitly enabled
    const shouldLoad =
      process.env.NEXT_PUBLIC_OPENREPLAY_ENABLED === "true" ||
      process.env.NODE_ENV === "production"

    if (!shouldLoad) {
      return
    }

    let tracker: any = null

    const initTracker = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const Tracker = (await import("@openreplay/tracker")).default
        const trackerAssist = (await import("@openreplay/tracker-assist")).default

        tracker = new Tracker({
          projectKey: "ffWAIUGTbDm7vspytAs5",
          defaultInputMode: 0, // 0 - plain, 1 - obscured, 2 - ignored
          obscureTextNumbers: true,
          obscureTextEmails: false,
        })

        // Enable Assist plugin for live support
        tracker.use(trackerAssist())

        tracker.start()
      } catch (error) {
        console.error("Failed to initialize OpenReplay tracker:", error)
      }
    }

    initTracker()

    // Cleanup on unmount
    return () => {
      if (tracker) {
        tracker.stop?.()
      }
    }
  }, [])

  return null
}
