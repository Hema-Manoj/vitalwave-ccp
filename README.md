# VitalWave - Real-Time Patient Monitoring Platform

VitalWave is an IoT-based Ambulance-to-Hospital Real-Time Patient Monitoring platform built with Next.js and Firebase.

## Features

### Ambulance Dashboard
- Ambulance profile management
- Patient onboarding with auto-generated IDs
- Live vitals monitoring (Heart Rate, SpO₂)
- Color-coded health indicators (Normal/Warning/Critical)
- Trip management (Start/End Trip)
- Location tracking with ETA
- Patient history

### Hospital Dashboard
- Overview of active ambulances and incoming patients
- Real-time patient monitoring
- Clickable patient cards for detailed views
- Critical case alerts
- Vital trend visualization with charts
- Severity risk assessment
- Handover summary for patient transitions

### Real-Time Synchronization
- Firebase Realtime Database for instant data sync
- Live vitals updates every 3 seconds
- Automatic sync between ambulance and hospital dashboards
- Connection status indicator
- Offline detection

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Authentication
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firebase Realtime Database
3. Enable Firebase Authentication (Email/Password)
4. Get your Firebase configuration

### Environment Variables

Add these to your Vercel project or `.env.local`:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

### Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3000

## Usage

### For Ambulance Users
1. Sign up at `/ambulance/signup`
2. Create a new patient with "New Patient"
3. Enter patient details (optional except Patient ID)
4. Monitor live vitals
5. Start trip when ready
6. End trip upon arrival

### For Hospital Users
1. Sign up at `/hospital/signup`
2. View incoming patients on dashboard
3. Click patient cards for detailed monitoring
4. View real-time vitals and trends
5. Access handover summary

## Database Structure

\`\`\`
├── ambulances/
│   └── {userId}
│       ├── ambulanceId
│       ├── vehicleNumber
│       ├── driverName
│       ├── status
│       └── ...
├── hospitals/
│   └── {userId}
│       ├── name
│       ├── address
│       ├── contactNumber
│       └── ...
└── patients/
    └── {patientId}
        ├── patientId
        ├── ambulanceId
        ├── vitals
        ├── status
        └── ...
\`\`\`

## License

MIT
