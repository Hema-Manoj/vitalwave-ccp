"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Calendar, MapPin, Clock, Maximize2 } from "lucide-react"
import type { Patient } from "@/lib/types"
import { VitalIndicator } from "./vital-indicator"

interface PatientCardProps {
  patient: Patient
  onClick?: () => void
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  const statusColors = {
    onboarding: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    "in-transit": "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    arrived: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    completed: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  }

  return (
    <Card className="hover:shadow-lg transition-all border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">{patient.name || "Patient"}</p>
              <p className="text-sm text-muted-foreground">ID: {patient.patientId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[patient.status]}>{patient.status}</Badge>
            <Button variant="outline" size="sm" onClick={onClick}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {patient.age && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Age: {patient.age}</span>
            {patient.gender && <span className="ml-2">• {patient.gender}</span>}
          </div>
        )}

        {patient.vitalReadingStarted && (
          <div className="grid grid-cols-2 gap-3">
            <VitalIndicator type="heart-rate" value={patient.vitals.heartRate} />
            <VitalIndicator type="spo2" value={patient.vitals.spo2} />
          </div>
        )}

        {patient.distance && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{patient.distance.toFixed(1)} km away</span>
            </div>
            {patient.eta && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>ETA: {patient.eta} min</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
