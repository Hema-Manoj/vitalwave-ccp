"use client"

import { use, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ref, onValue, update } from "firebase/database"
import { database } from "@/lib/firebase"
import type { Patient } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Play, Square, MapPin, Clock, ActivityIcon, CheckCircle, XCircle } from "lucide-react"
import { VitalIndicator } from "@/components/vital-indicator"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { VitalTrendChart } from "@/components/vital-trend-chart"
import { PDFDownloadButton } from "@/components/pdf-download-button"

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    notes: "",
    initialDiagnosis: "",
  })

  useEffect(() => {
    if (user) {
      const patientRef = ref(database, `patients/${resolvedParams.id}`)
      const unsubscribe = onValue(patientRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val()
          setPatient(data)
          setFormData({
            name: data.name || "",
            age: data.age?.toString() || "",
            gender: data.gender || "",
            notes: data.notes || "",
            initialDiagnosis: data.initialDiagnosis || "",
          })
        }
      })

      const vitalsInterval = setInterval(async () => {
        const snapshot = await onValue(
          ref(database, `patients/${resolvedParams.id}`),
          (snap) => {
            if (snap.exists() && snap.val().vitalReadingStarted) {
              const heartRate = 60 + Math.floor(Math.random() * 40)
              const spo2 = 92 + Math.floor(Math.random() * 8)

              update(ref(database, `patients/${resolvedParams.id}/vitals`), {
                heartRate,
                spo2,
                timestamp: Date.now(),
              })
            }
          },
          { onlyOnce: true },
        )
      }, 3000)

      return () => {
        unsubscribe()
        clearInterval(vitalsInterval)
      }
    }
  }, [user, resolvedParams.id])

  const handleSave = async () => {
    if (!patient) return

    await update(ref(database, `patients/${resolvedParams.id}`), {
      name: formData.name || undefined,
      age: formData.age ? Number.parseInt(formData.age) : undefined,
      gender: formData.gender || undefined,
      notes: formData.notes || undefined,
      initialDiagnosis: formData.initialDiagnosis || undefined,
    })

    setIsEditing(false)
  }

  const handleStartTrip = async () => {
    if (!patient) return

    await update(ref(database, `patients/${resolvedParams.id}`), {
      status: "in-transit",
      tripStartTime: Date.now(),
      distance: 5.2,
      eta: 12,
    })
  }

  const handleEndTrip = async () => {
    if (!patient) return

    await update(ref(database, `patients/${resolvedParams.id}`), {
      status: "arrived",
      tripEndTime: Date.now(),
      distance: 0,
      eta: 0,
    })

    router.push("/ambulance")
  }

  const handleStartVitalReading = async () => {
    if (!patient) return

    const heartRate = 60 + Math.floor(Math.random() * 40)
    const spo2 = 92 + Math.floor(Math.random() * 8)

    await update(ref(database, `patients/${resolvedParams.id}`), {
      vitalReadingStarted: true,
      vitals: {
        heartRate,
        spo2,
        timestamp: Date.now(),
      },
    })
  }

  const handleReleasePatient = async () => {
    if (!patient) return

    await update(ref(database, `patients/${resolvedParams.id}`), {
      status: "completed",
      tripEndTime: Date.now(),
      releasedAt: Date.now(),
    })

    setShowReleaseDialog(false)
    router.push("/ambulance")
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/ambulance"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <PDFDownloadButton patient={patient} />
              {!patient.vitalReadingStarted && (
                <Button onClick={handleStartVitalReading} variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Start Vital Reading
                </Button>
              )}
              {patient.status === "onboarding" && (
                <Button onClick={handleStartTrip} size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Start Trip
                </Button>
              )}
              {patient.status === "in-transit" && (
                <Button onClick={handleEndTrip} variant="destructive" size="sm">
                  <Square className="h-4 w-4 mr-2" />
                  End Trip
                </Button>
              )}
              {(patient.status === "in-transit" || patient.status === "arrived") && (
                <Button onClick={() => setShowReleaseDialog(true)} variant="default" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Release Patient
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Patient Info */}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Patient Information</CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input id="patientId" value={patient.patientId} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Patient name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="initialDiagnosis">Initial Diagnosis</Label>
                <Textarea
                  id="initialDiagnosis"
                  placeholder="Initial diagnosis or condition"
                  value={formData.initialDiagnosis}
                  onChange={(e) => setFormData({ ...formData, initialDiagnosis: e.target.value })}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Medical notes and observations"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Vitals */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-primary animate-pulse" />
              Live Vitals
              {patient.vitalReadingStarted && (
                <span className="text-xs font-normal text-muted-foreground ml-2">(Reading Active)</span>
              )}
              {!patient.vitalReadingStarted && (
                <span className="text-xs font-normal text-muted-foreground ml-2">(Not Started)</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.vitalReadingStarted ? (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <VitalIndicator type="heart-rate" value={patient.vitals.heartRate} />
                  <VitalIndicator type="spo2" value={patient.vitals.spo2} />
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Last updated: {new Date(patient.vitals.timestamp).toLocaleTimeString()}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Vital reading not started. Click "Start Vital Reading" to begin monitoring.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vital Trend Chart */}
        {patient.vitalReadingStarted && (
          <VitalTrendChart heartRate={patient.vitals.heartRate} spo2={patient.vitals.spo2} />
        )}

        {/* Location & Trip Info */}
        {patient.status === "in-transit" && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Trip Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  <MapPin className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Distance to Hospital</p>
                    <p className="text-2xl font-bold">{patient.distance?.toFixed(1)} km</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                  <Clock className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Time</p>
                    <p className="text-2xl font-bold">{patient.eta} min</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Release Patient Confirmation Dialog */}
      <AlertDialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Release Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to release this patient? This will mark the patient as completed and end the
              monitoring session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReleasePatient}>Release Patient</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
