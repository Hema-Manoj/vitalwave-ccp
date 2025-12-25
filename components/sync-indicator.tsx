"use client"

import { useEffect, useState } from "react"
import { ref, onValue } from "firebase/database"
import { database } from "@/lib/firebase"
import { Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface SyncIndicatorProps {
  className?: string
}

export function SyncIndicator({ className }: SyncIndicatorProps) {
  const [isConnected, setIsConnected] = useState(true)
  const [lastSync, setLastSync] = useState<Date>(new Date())

  useEffect(() => {
    const connectedRef = ref(database, ".info/connected")

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      const connected = snapshot.val() === true
      setIsConnected(connected)

      if (connected) {
        setLastSync(new Date())
      }
    })

    // Update sync timestamp every 5 seconds when connected
    const interval = setInterval(() => {
      if (isConnected) {
        setLastSync(new Date())
      }
    }, 5000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [isConnected])

  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      {isConnected ? (
        <>
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Wifi className="h-3 w-3 animate-pulse" />
            <span className="font-medium">Live</span>
          </div>
          <span className="text-muted-foreground">• Synced {lastSync.toLocaleTimeString()}</span>
        </>
      ) : (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <WifiOff className="h-3 w-3" />
          <span className="font-medium">Offline</span>
        </div>
      )}
    </div>
  )
}
