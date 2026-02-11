"use client"

import { use, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ref, onValue } from "firebase/database"
import { getFirebaseDatabase } from "@/lib/firebase"
import type { Patient } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Activity } from "lucide-react"
import { PatientCard } from "@/components/patient-card"
import Link from "next/link"

export default function FilteredPatientsPage({ params }: { params: Promise<{ filter: string }> }) {
  const resolvedParams = use(params)
  const { user, loading } = useAuth()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/hospital/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      const patientsRef = ref(getFirebaseDatabase(), "patients")
      const unsubscribe = onValue(patientsRef, (snapshot) => {
        if (snapshot.exists()) {
          const allPatients = Object.values(snapshot.val()) as Patient[]
          let filtered: Patient[] = []

          switch (resolvedParams.filter) {
            case "incoming":
              filtered = allPatients.filter((p) => p.status === "in-transit" || p.status === "onboarding")
              break
            case "critical":
              filtered = allPatients.filter((p) => {
                const hr = p.vitals.heartRate
                const spo2 = p.vitals.spo2
                return hr < 40 || hr > 140 || spo2 < 90
              })
              break
            case "active-ambulances":
              filtered = allPatients.filter((p) => p.status === "in-transit")
              break
            default:
              filtered = allPatients
          }

          setPatients(filtered)
        }
      })

      return () => unsubscribe()
    }
  }, [user, resolvedParams.filter])

  const getTitle = () => {
    switch (resolvedParams.filter) {
      case "incoming":
        return "Incoming Patients"
      case "critical":
        return "Critical Cases"
      case "active-ambulances":
        return "Active Ambulances"
      default:
        return "All Patients"
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-primary">
          <Activity className="h-6 w-6 animate-pulse" />
          <span className="text-lg font-medium">Loading...</span>
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
        <h1 className="text-3xl font-bold">{getTitle()}</h1>

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
              <p className="text-sm text-muted-foreground">No patients match this filter</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
