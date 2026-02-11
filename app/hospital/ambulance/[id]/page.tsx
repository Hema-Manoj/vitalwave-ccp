"use client"

import { use, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ref, onValue } from "firebase/database"
import { getFirebaseDatabase } from "@/lib/firebase"
import type { AmbulanceProfile, Patient } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Activity, Car } from "lucide-react"
import { PatientCard } from "@/components/patient-card"
import Link from "next/link"

export default function AmbulanceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user, loading } = useAuth()
  const router = useRouter()
  const [ambulance, setAmbulance] = useState<AmbulanceProfile | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/hospital/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      const ambulanceRef = ref(getFirebaseDatabase(), `ambulances/${resolvedParams.id}`)
      const unsubscribe = onValue(ambulanceRef, (snapshot) => {
        if (snapshot.exists()) {
          setAmbulance(snapshot.val())
        }
      })

      const patientsRef = ref(getFirebaseDatabase(), "patients")
      const patientsUnsubscribe = onValue(patientsRef, (snapshot) => {
        if (snapshot.exists()) {
          const allPatients = Object.values(snapshot.val()) as Patient[]
          const ambulancePatients = allPatients.filter((p) => p.ambulanceId === resolvedParams.id)
          setPatients(ambulancePatients)
        }
      })

      return () => {
        unsubscribe()
        patientsUnsubscribe()
      }
    }
  }, [user, resolvedParams.id])

  if (loading || !user || !ambulance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-primary">
          <Activity className="h-6 w-6 animate-pulse" />
          <span className="text-lg font-medium">Loading ambulance details...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/hospital"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <h1 className="text-3xl font-bold">Ambulance Details</h1>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Ambulance Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ambulance ID</p>
                <p className="font-semibold">{ambulance.ambulanceId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vehicle Number</p>
                <p className="font-semibold">{ambulance.vehicleNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={ambulance.status === "available" ? "default" : "secondary"}>{ambulance.status}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Driver Name</p>
                <p className="font-semibold">{ambulance.driverName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Driver Contact</p>
                <p className="font-semibold">{ambulance.driverContact}</p>
              </div>
              {ambulance.helperName && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Helper Name</p>
                  <p className="font-semibold">{ambulance.helperName}</p>
                </div>
              )}
              {ambulance.helperContact && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Helper Contact</p>
                  <p className="font-semibold">{ambulance.helperContact}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Hospital Registration ID</p>
                <p className="font-semibold">{ambulance.hospitalRegistrationId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Patients from this Ambulance</h2>
          {patients.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {patients.map((patient) => (
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
                <p className="text-lg font-semibold mb-2">No patients found</p>
                <p className="text-sm text-muted-foreground">This ambulance has no patients</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
