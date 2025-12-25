"use client"

import type React from "react"

import { useState } from "react"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { ref, set } from "firebase/database"
import { auth, database } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Ambulance, Activity, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AmbulanceSignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    ambulanceId: "",
    vehicleNumber: "",
    driverName: "",
    driverContact: "",
    hospitalRegistrationId: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      console.log("[v0] Starting signup process...")
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const userId = userCredential.user.uid
      console.log("[v0] User created successfully:", userId)

      // Save ambulance profile to database
      console.log("[v0] Saving ambulance profile to database...")
      await set(ref(database, `ambulances/${userId}`), {
        id: userId,
        ambulanceId: formData.ambulanceId,
        vehicleNumber: formData.vehicleNumber,
        driverName: formData.driverName,
        driverContact: formData.driverContact,
        hospitalRegistrationId: formData.hospitalRegistrationId,
        status: "available",
        createdAt: Date.now(),
      })
      console.log("[v0] Profile saved successfully")

      localStorage.setItem("userRole", "ambulance")
      router.push("/ambulance")
    } catch (err: any) {
      console.error("[v0] Signup error:", err)
      console.error("[v0] Error code:", err.code)
      console.error("[v0] Error message:", err.message)

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login instead.")
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.")
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.")
      } else if (err.code === "auth/missing-email") {
        setError("Please enter an email address.")
      } else if (err.code === "auth/configuration-not-found" || err.code === "auth/invalid-api-key") {
        setError("Firebase is not configured correctly. Please check your environment variables.")
      } else {
        setError(`Signup failed: ${err.message || "Please check your Firebase configuration and try again."}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card className="border-2">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Ambulance className="h-7 w-7 text-primary" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl">VitalWave Ambulance</CardTitle>
            </div>
            <CardDescription className="text-base">Create your ambulance account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ambulance@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ambulanceId">Ambulance ID *</Label>
                  <Input
                    id="ambulanceId"
                    name="ambulanceId"
                    placeholder="AMB-001"
                    value={formData.ambulanceId}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                  <Input
                    id="vehicleNumber"
                    name="vehicleNumber"
                    placeholder="ABC-1234"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospitalRegistrationId">Hospital Registration ID *</Label>
                  <Input
                    id="hospitalRegistrationId"
                    name="hospitalRegistrationId"
                    placeholder="HOSP-001"
                    value={formData.hospitalRegistrationId}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverName">Driver Name *</Label>
                  <Input
                    id="driverName"
                    name="driverName"
                    placeholder="John Doe"
                    value={formData.driverName}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverContact">Driver Contact *</Label>
                  <Input
                    id="driverContact"
                    name="driverContact"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.driverContact}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/ambulance/login" className="text-primary hover:underline font-medium">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
