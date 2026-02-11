"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ref, onValue, set, push } from "firebase/database"
import { getFirebaseDatabase } from "@/lib/firebase"
import type { AmbulanceProfile, Patient } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Ambulance, LogOut, Plus, User, Car, Clock } from "lucide-react"
import { PatientCard } from "@/components/patient-card"
import { SyncIndicator } from "@/components/sync-indicator"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatButton } from "@/components/chat-button"
import { ChatDialog } from "@/components/chat-dialog"

export default function AmbulanceDashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<AmbulanceProfile | null>(null)
  const [activePatient, setActivePatient] = useState<Patient | null>(null)
  const [patientHistory, setPatientHistory] = useState<Patient[]>([])
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [newPatientForm, setNewPatientForm] = useState({
    name: "",
    age: "",
    gender: "",
    initialDiagnosis: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/ambulance/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      const profileRef = ref(getFirebaseDatabase(), `ambulances/${user.uid}`)
      const unsubscribe = onValue(profileRef, (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.val())
        }
      })

      const patientsRef = ref(getFirebaseDatabase(), `patients`)
      const patientsUnsubscribe = onValue(patientsRef, (snapshot) => {
        if (snapshot.exists()) {
          const allPatients = Object.values(snapshot.val()) as Patient[]
          const myActivePatient = allPatients.find(
            (p) => p.ambulanceId === user.uid && (p.status === "onboarding" || p.status === "in-transit"),
          )
          setActivePatient(myActivePatient || null)

          const history = allPatients.filter(
            (p) => p.ambulanceId === user.uid && (p.status === "arrived" || p.status === "completed"),
          )
          setPatientHistory(history.sort((a, b) => b.createdAt - a.createdAt))
        }
      })

      return () => {
        unsubscribe()
        patientsUnsubscribe()
      }
    }
  }, [user])

  const handleNewPatient = () => {
    setShowNewPatientDialog(true)
    setNewPatientForm({ name: "", age: "", gender: "", initialDiagnosis: "" })
  }

  const handleCreatePatient = async () => {
    if (!user || !newPatientForm.name.trim()) return

    const patientId = `PAT-${Date.now().toString().slice(-6)}`
    const newPatientRef = push(ref(getFirebaseDatabase(), "patients"))

    const newPatient: Patient = {
      id: newPatientRef.key!,
      patientId,
      ambulanceId: user.uid,
      name: newPatientForm.name,
      age: newPatientForm.age ? Number.parseInt(newPatientForm.age) : undefined,
      gender: newPatientForm.gender as "male" | "female" | "other" | undefined,
      initialDiagnosis: newPatientForm.initialDiagnosis || undefined,
      vitals: {
        heartRate: 0,
        spo2: 0,
        timestamp: Date.now(),
      },
      vitalReadingStarted: false,
      status: "onboarding",
      createdAt: Date.now(),
    }

    await set(newPatientRef, newPatient)
    setShowNewPatientDialog(false)
    router.push(`/ambulance/patient/${newPatientRef.key}`)
  }

  const toggleStatus = async () => {
    if (!user || !profile) return

    const newStatus = profile.status === "available" ? "on-trip" : "available"
    await set(ref(getFirebaseDatabase(), `ambulances/${user.uid}/status`), newStatus)
  }

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-primary">
          <Activity className="h-6 w-6 animate-pulse" />
          <span className="text-lg font-medium">Loading dashboard...</span>
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
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Ambulance className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                  VitalWave Ambulance
                  <Badge variant={profile.status === "available" ? "default" : "secondary"} className="ml-2">
                    {profile.status}
                  </Badge>
                </h1>
                <p className="text-xs text-muted-foreground">{profile.ambulanceId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SyncIndicator />
              <ChatButton userId={user.uid} userRole="ambulance" onClick={() => setChatOpen(true)} />
              <ThemeToggle />
              <Button variant="outline" onClick={signOut} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Ambulance Profile */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Ambulance Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vehicle Number</p>
                <p className="font-semibold">{profile.vehicleNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Driver</p>
                <p className="font-semibold">{profile.driverName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-semibold">{profile.driverContact}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Hospital Registration</p>
                <p className="font-semibold">{profile.hospitalRegistrationId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  <Badge variant={profile.status === "available" ? "default" : "secondary"}>{profile.status}</Badge>
                  <Button size="sm" variant="outline" onClick={toggleStatus}>
                    Toggle
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Patient */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Active Patient</h2>
            <Button onClick={handleNewPatient} disabled={!!activePatient} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              New Patient
            </Button>
          </div>

          {activePatient ? (
            <PatientCard
              patient={activePatient}
              onClick={() => router.push(`/ambulance/patient/${activePatient.id}`)}
            />
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold mb-2">No Active Patient</p>
                <p className="text-sm text-muted-foreground mb-4">Click "New Patient" to start monitoring</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Patient History */}
        {patientHistory.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Patient History</h2>
            <div className="grid gap-4">
              {patientHistory.slice(0, 5).map((patient) => (
                <Card key={patient.id} className="border">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{patient.name || "Patient"}</p>
                          <p className="text-sm text-muted-foreground">ID: {patient.patientId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(patient.createdAt).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="outline">{patient.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* New Patient Dialog */}
      <Dialog open={showNewPatientDialog} onOpenChange={setShowNewPatientDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>Enter basic patient information to begin monitoring</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Patient Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter patient name"
                value={newPatientForm.name}
                onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Expected Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter age (optional)"
                value={newPatientForm.age}
                onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={newPatientForm.gender}
                onValueChange={(value) => setNewPatientForm({ ...newPatientForm, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Initial Diagnosis</Label>
              <Textarea
                id="diagnosis"
                placeholder="Enter initial diagnosis or condition (optional)"
                value={newPatientForm.initialDiagnosis}
                onChange={(e) => setNewPatientForm({ ...newPatientForm, initialDiagnosis: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPatientDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePatient} disabled={!newPatientForm.name.trim()}>
              Add Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <ChatDialog open={chatOpen} onOpenChange={setChatOpen} userId={user.uid} userRole="ambulance" />
    </div>
  )
}
