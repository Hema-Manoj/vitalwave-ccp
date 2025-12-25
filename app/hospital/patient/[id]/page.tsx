"use client"

import { use, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ref, onValue } from "firebase/database"
import { database } from "@/lib/firebase"
import type { Patient } from "@/lib/types"
import { getVitalStatus } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Clock, ActivityIcon, Ambulance, User, Calendar, AlertTriangle } from "lucide-react"
import { VitalIndicator } from "@/components/vital-indicator"
import Link from "next/link"
import { VitalTrendChart } from "@/components/vital-trend-chart"
import { PDFDownloadButton } from "@/components/pdf-download-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatButton } from "@/components/chat-button"
import { ChatDialog } from "@/components/chat-dialog"

export default function HospitalPatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user, loading } = useAuth()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/hospital/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      const patientRef = ref(database, `patients/${resolvedParams.id}`)
      const unsubscribe = onValue(patientRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val()
          setPatient(data)
        }
      })

      return () => {
        unsubscribe()
      }
    }
  }, [user, resolvedParams.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-primary">
          <ActivityIcon className="h-6 w-6 animate-pulse" />
          <span className="text-lg font-medium">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-primary">
          <ActivityIcon className="h-6 w-6 animate-pulse" />
          <span className="text-lg font-medium">Loading patient data...</span>
        </div>
      </div>
    )
  }

  const vitalStatus = getVitalStatus(patient.vitals.heartRate, patient.vitals.spo2)
  const statusColors = {
    onboarding: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    "in-transit": "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    arrived: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    completed: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  }

  const severityColors = {
    normal: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    critical: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/hospital"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <PDFDownloadButton patient={patient} />
              <Badge className={statusColors[patient.status]}>{patient.status}</Badge>
              <Badge className={severityColors[vitalStatus]}>{vitalStatus} vitals</Badge>
              <ChatButton userId={user.uid} userRole="hospital" onClick={() => setChatOpen(true)} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Patient Info */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Patient ID</p>
                <p className="font-semibold text-lg">{patient.patientId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{patient.name || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Age / Gender</p>
                <p className="font-semibold">
                  {patient.age || "N/A"} / {patient.gender || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ambulance ID</p>
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold flex items-center gap-2"
                  onClick={() => router.push(`/hospital/ambulance/${patient.ambulanceId}`)}
                >
                  <Ambulance className="h-4 w-4 text-primary" />
                  {patient.ambulanceId.slice(0, 8)}...
                </Button>
              </div>
            </div>

            {patient.initialDiagnosis && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Initial Diagnosis</p>
                <p className="text-sm">{patient.initialDiagnosis}</p>
              </div>
            )}

            {patient.notes && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Medical Notes</p>
                <p className="text-sm">{patient.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Critical Alert */}
        {vitalStatus === "critical" && (
          <Card className="border-2 border-red-500 bg-red-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="font-bold text-lg text-red-700 dark:text-red-400">Critical Vitals Detected</p>
                  <p className="text-sm text-muted-foreground">Immediate medical attention required upon arrival</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Live Vitals */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-primary animate-pulse" />
              Live Vitals Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <VitalIndicator type="heart-rate" value={patient.vitals.heartRate} />
              <VitalIndicator type="spo2" value={patient.vitals.spo2} />
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Last updated: {new Date(patient.vitals.timestamp).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        {patient.vitalReadingStarted && (
          <VitalTrendChart heartRate={patient.vitals.heartRate} spo2={patient.vitals.spo2} />
        )}

        {/* Location & ETA */}
        {patient.status === "in-transit" && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location & ETA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  <MapPin className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Distance</p>
                    <p className="text-3xl font-bold">{patient.distance?.toFixed(1)} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Arrival</p>
                    <p className="text-3xl font-bold">{patient.eta} min</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Severity Assessment */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Severity & Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-6 rounded-lg bg-muted">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Risk Level</p>
                <Badge className={`${severityColors[vitalStatus]} text-lg py-2 px-4`}>{vitalStatus}</Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Rule-Based Assessment</p>
                <p className="text-xs text-muted-foreground">(AI-based scoring coming soon)</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Heart Rate Status:</span>
                <Badge
                  variant="outline"
                  className={patient.vitals.heartRate < 40 || patient.vitals.heartRate > 140 ? "border-red-500" : ""}
                >
                  {patient.vitals.heartRate < 40 || patient.vitals.heartRate > 140 ? "Critical" : "Stable"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">SpO₂ Status:</span>
                <Badge variant="outline" className={patient.vitals.spo2 < 90 ? "border-red-500" : ""}>
                  {patient.vitals.spo2 < 90 ? "Critical" : patient.vitals.spo2 < 94 ? "Warning" : "Stable"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Handover Summary */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Handover Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Patient ID</p>
                  <p className="font-semibold">{patient.patientId}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Onboarded At</p>
                  <p className="font-semibold">{new Date(patient.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Current HR</p>
                  <p className="font-semibold">{patient.vitals.heartRate} bpm</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Current SpO₂</p>
                  <p className="font-semibold">{patient.vitals.spo2}%</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Trip Summary</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {patient.tripStartTime ? new Date(patient.tripStartTime).toLocaleTimeString() : "Not started"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ambulance className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patient.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {patient.tripStartTime
                        ? `${Math.floor((Date.now() - patient.tripStartTime) / 60000)} min ago`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <ChatDialog open={chatOpen} onOpenChange={setChatOpen} userId={user.uid} userRole="hospital" />
    </div>
  )
}
