"use client"

import { useEffect, useState } from "react"
import { ref, onValue, off } from "firebase/database"
import { getFirebaseDatabase } from "@/lib/firebase"
import type { Patient, AmbulanceProfile } from "@/lib/types"

export function useRealtimePatients(ambulanceId?: string) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const patientsRef = ref(getFirebaseDatabase(), "patients")

    const unsubscribe = onValue(
      patientsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const allPatients = Object.values(snapshot.val()) as Patient[]
          const filtered = ambulanceId ? allPatients.filter((p) => p.ambulanceId === ambulanceId) : allPatients
          setPatients(filtered)
        } else {
          setPatients([])
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching patients:", error)
        setLoading(false)
      },
    )

    return () => {
      off(patientsRef, "value", unsubscribe)
    }
  }, [ambulanceId])

  return { patients, loading }
}

export function useRealtimePatient(patientId: string) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!patientId) return

    const patientRef = ref(getFirebaseDatabase(), `patients/${patientId}`)

    const unsubscribe = onValue(
      patientRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setPatient(snapshot.val())
        } else {
          setPatient(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching patient:", error)
        setLoading(false)
      },
    )

    return () => {
      off(patientRef, "value", unsubscribe)
    }
  }, [patientId])

  return { patient, loading }
}

export function useRealtimeAmbulance(ambulanceId: string) {
  const [ambulance, setAmbulance] = useState<AmbulanceProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ambulanceId) return

    const ambulanceRef = ref(getFirebaseDatabase(), `ambulances/${ambulanceId}`)

    const unsubscribe = onValue(
      ambulanceRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setAmbulance(snapshot.val())
        } else {
          setAmbulance(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching ambulance:", error)
        setLoading(false)
      },
    )

    return () => {
      off(ambulanceRef, "value", unsubscribe)
    }
  }, [ambulanceId])

  return { ambulance, loading }
}
