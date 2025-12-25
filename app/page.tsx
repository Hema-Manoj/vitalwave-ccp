"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Activity, Ambulance, Building2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && role) {
      // Redirect to appropriate dashboard
      if (role === "ambulance") {
        router.push("/ambulance")
      } else if (role === "hospital") {
        router.push("/hospital")
      }
    }
  }, [user, role, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-primary">
          <Activity className="h-6 w-6 animate-pulse" />
          <span className="text-lg font-medium">Loading VitalWave...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">VitalWave</h1>
              <p className="text-xs text-muted-foreground">Real-Time Patient Monitoring</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Infrastructure to Power the Future of Healthcare
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Real-time ambulance-to-hospital coordination with live vital monitoring, location tracking, and instant
            alerts
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Ambulance Card */}
          <Card className="p-8 hover:shadow-lg transition-all border-2 hover:border-primary/50">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Ambulance className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Ambulance</h3>
                <p className="text-muted-foreground mb-6">
                  Monitor patients, track location, and share real-time vitals with hospitals
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Link href="/ambulance/login" className="w-full">
                  <Button size="lg" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/ambulance/signup" className="w-full">
                  <Button size="lg" variant="outline" className="w-full bg-transparent">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Hospital Card */}
          <Card className="p-8 hover:shadow-lg transition-all border-2 hover:border-primary/50">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Hospital</h3>
                <p className="text-muted-foreground mb-6">
                  View incoming patients, monitor vitals, and prepare for arrivals
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Link href="/hospital/login" className="w-full">
                  <Button size="lg" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/hospital/signup" className="w-full">
                  <Button size="lg" variant="outline" className="w-full bg-transparent">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="h-12 w-12 rounded-lg bg-(--color-success)/10 text-(--color-success) flex items-center justify-center mx-auto mb-3">
              <Activity className="h-6 w-6" />
            </div>
            <h4 className="font-semibold mb-2">Live Vitals</h4>
            <p className="text-sm text-muted-foreground">
              Real-time heart rate and SpO₂ monitoring with color-coded alerts
            </p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Ambulance className="h-6 w-6" />
            </div>
            <h4 className="font-semibold mb-2">Location Tracking</h4>
            <p className="text-sm text-muted-foreground">Live ambulance location with distance and ETA updates</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 rounded-lg bg-(--color-warning)/10 text-(--color-warning) flex items-center justify-center mx-auto mb-3">
              <Building2 className="h-6 w-6" />
            </div>
            <h4 className="font-semibold mb-2">Instant Sync</h4>
            <p className="text-sm text-muted-foreground">
              Automatic data sync between ambulance and hospital dashboards
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
