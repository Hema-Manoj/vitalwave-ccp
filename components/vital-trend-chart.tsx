"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Activity } from "lucide-react"

interface VitalTrendChartProps {
  heartRate: number
  spo2: number
}

export function VitalTrendChart({ heartRate, spo2 }: VitalTrendChartProps) {
  const [trendData, setTrendData] = useState<Array<{ time: string; heartRate: number; spo2: number }>>([])

  useEffect(() => {
    const now = new Date()
    const timeLabel = now.toLocaleTimeString()

    setTrendData((prev) => {
      const newData = [...prev, { time: timeLabel, heartRate, spo2 }]
      // Keep only last 20 data points
      return newData.slice(-20)
    })
  }, [heartRate, spo2])

  return (
    <Card className="border-2 mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Vital Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            heartRate: {
              label: "Heart Rate (bpm)",
              color: "hsl(var(--chart-1))",
            },
            spo2: {
              label: "SpO2 (%)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="time" className="text-xs" tick={{ fontSize: 10 }} />
              <YAxis className="text-xs" tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="heartRate"
                stroke="var(--color-heartRate)"
                name="Heart Rate"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="spo2"
                stroke="var(--color-spo2)"
                name="SpO2"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
