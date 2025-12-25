import { cn } from "@/lib/utils"
import { Heart, Activity } from "lucide-react"
import type { VitalStatus } from "@/lib/types"
import { getVitalStatus } from "@/lib/types"

interface VitalIndicatorProps {
  type: "heart-rate" | "spo2"
  value: number
  className?: string
}

export function VitalIndicator({ type, value, className }: VitalIndicatorProps) {
  const status: VitalStatus = type === "heart-rate" ? getVitalStatus(value, 95) : getVitalStatus(75, value)

  const statusConfig = {
    normal: {
      bg: "bg-green-500/10",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-500/20",
      ring: "ring-green-500/20",
    },
    warning: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-700 dark:text-yellow-400",
      border: "border-yellow-500/20",
      ring: "ring-yellow-500/20",
    },
    critical: {
      bg: "bg-red-500/10",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-500/20",
      ring: "ring-red-500/20",
    },
  }

  const config = statusConfig[status]
  const Icon = type === "heart-rate" ? Heart : Activity

  return (
    <div
      className={cn("rounded-xl border-2 p-4 ring-4 transition-all", config.bg, config.border, config.ring, className)}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-8 w-8", config.text)} />
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{type === "heart-rate" ? "Heart Rate" : "SpO₂"}</p>
          <p className={cn("text-3xl font-bold", config.text)}>
            {value}
            <span className="text-lg ml-1">{type === "heart-rate" ? "bpm" : "%"}</span>
          </p>
        </div>
        <div className={cn("px-3 py-1 rounded-full text-xs font-semibold uppercase", config.bg, config.text)}>
          {status}
        </div>
      </div>
    </div>
  )
}
