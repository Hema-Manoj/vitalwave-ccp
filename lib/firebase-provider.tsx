"use client"

import { useEffect, useState, type ReactNode } from "react"
import { initFirebase } from "./firebase"

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initFirebase().then(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading VitalWave...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
