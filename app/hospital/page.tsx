"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ref, onValue } from "firebase/database"
import { getFirebaseDatabase } from "@/lib/firebase"
import type { Hospital, Patient } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Building2, LogOut, Ambulance, Users, AlertCircle } from "lucide-react"
import { PatientCard } from "@/components/patient-card"
import { SyncIndicator } from "@/components/sync-indicator"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatButton } from "@/components/chat-button"
import { ChatDialog } from "@/components/chat-dialog"

export default function HospitalDashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [incomingPatients, setIncomingPatients] = useState<Patient[]>([])
  const [activeAmbulances, setActiveAmbulances] = useState<number>(0)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/hospital/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      // Load hospital profile
      const hospitalRef = ref(getFirebaseDatabase(), `hospitals/${user.uid}`)
      const unsubscribe = onValue(hospitalRef, (snapshot) => {
        if (snapshot.exists()) {
          setHospital(snapshot.val())
        }
      })

      // Load all incoming patients
      const patientsRef = ref(getFirebaseDatabase(), `patients`)
      const patientsUnsubscribe = onValue(patientsRef, (snapshot) => {
        if (snapshot.exists()) {
          const allPatients = Object.values(snapshot.val()) as Patient[]
          const incoming = allPatients.filter((p) => p.status === "in-transit" || p.status === "onboarding")
          setIncomingPatients(incoming.sort((a, b) => (a.eta || 999) - (b.eta || 999)))

          // Count unique ambulances
          const uniqueAmbulances = new Set(incoming.map((p) => p.ambulanceId))
          setActiveAmbulances(uniqueAmbulances.size)
        }
      })

      return () => {
        unsubscribe()
        patientsUnsubscribe()
      }
    }
  }, [user])

  const criticalPatients = incomingPatients.filter((p) => {
    const hr = p.vitals.heartRate
    const spo2 = p.vitals.spo2
    return hr < 40 || hr > 140 || spo2 < 90
  })

  if (loading || !user || !hospital) {
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
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                  VitalWave Hospital
                  <Badge variant="default" className="ml-2">
                    Live
                  </Badge>
                </h1>
                <p className="text-xs text-muted-foreground">{hospital.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SyncIndicator />
              <ChatButton userId={user.uid} userRole="hospital" onClick={() => setChatOpen(true)} />
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
        {/* Overview Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card
            className="border-2 cursor-pointer hover:border-primary transition-colors"
            onClick={() => router.push("/hospital/patients/active-ambulances")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Ambulance className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Ambulances</p>
                  <p className="text-3xl font-bold">{activeAmbulances}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-2 cursor-pointer hover:border-primary transition-colors"
            onClick={() => router.push("/hospital/patients/incoming")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Incoming Patients</p>
                  <p className="text-3xl font-bold">{incomingPatients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-2 cursor-pointer hover:border-primary transition-colors"
            onClick={() => router.push("/hospital/patients/critical")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Critical Cases</p>
                  <p className="text-3xl font-bold">{criticalPatients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hospital Info */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Hospital Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{hospital.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-semibold">{hospital.address}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-semibold">{hospital.contactNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incoming Patients */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Incoming Patients</h2>

          {incomingPatients.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {incomingPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onClick={() => router.push(`/hospital/patient/${patient.id}`)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Ambulance className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold mb-2">No Incoming Patients</p>
                <p className="text-sm text-muted-foreground">All clear - no ambulances en route</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <ChatDialog open={chatOpen} onOpenChange={setChatOpen} userId={user.uid} userRole="hospital" />
    </div>
  )
}
