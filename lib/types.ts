export type UserRole = "ambulance" | "hospital"

export interface AmbulanceProfile {
  id: string
  ambulanceId: string
  vehicleNumber: string
  driverName: string
  driverContact: string
  helperName?: string
  helperContact?: string
  hospitalRegistrationId: string
  status: "available" | "on-trip"
  createdAt: number
}

export interface Patient {
  id: string
  patientId: string
  name?: string
  age?: number
  gender?: "male" | "female" | "other"
  notes?: string
  initialDiagnosis?: string
  vitalReadingStarted?: boolean
  ambulanceId: string
  hospitalId?: string
  vitals: {
    heartRate: number
    spo2: number
    timestamp: number
  }
  location?: {
    latitude: number
    longitude: number
    timestamp: number
  }
  eta?: number
  distance?: number
  tripStartTime?: number
  tripEndTime?: number
  releasedAt?: number
  status: "onboarding" | "in-transit" | "arrived" | "completed"
  createdAt: number
}

export interface Hospital {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  contactNumber: string
}

export interface VitalReading {
  heartRate: number
  spo2: number
  timestamp: number
}

export type VitalStatus = "normal" | "warning" | "critical"

export function getVitalStatus(heartRate: number, spo2: number): VitalStatus {
  // Critical: HR < 40 or > 140, SpO2 < 90
  if (heartRate < 40 || heartRate > 140 || spo2 < 90) {
    return "critical"
  }
  // Warning: HR < 50 or > 120, SpO2 < 94
  if (heartRate < 50 || heartRate > 120 || spo2 < 94) {
    return "warning"
  }
  return "normal"
}

export interface ChatMessage {
  id: string
  senderId: string
  senderRole: "ambulance" | "hospital"
  receiverId: string
  message: string
  timestamp: number
  read: boolean
}

export interface ChatConversation {
  id: string
  ambulanceId: string
  hospitalId: string
  lastMessage?: string
  lastMessageTime?: number
  unreadCount: number
}
