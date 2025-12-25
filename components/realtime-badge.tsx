"use client"

import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"

export function RealtimeBadge() {
  return (
    <Badge variant="default" className="bg-green-500 hover:bg-green-600 animate-pulse">
      <Activity className="h-3 w-3 mr-1" />
      Real-Time
    </Badge>
  )
}
