import type { Auth } from "firebase/auth"
import type { Database } from "firebase/database"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let _auth: Auth | undefined
let _db: Database | undefined
let _initPromise: Promise<void> | undefined

/**
 * Initialises Firebase using dynamic imports so that the firebase/* modules
 * are only loaded at runtime on the client (never during SSR / module evaluation).
 * Calling it multiple times is safe – the same promise is reused.
 */
export function initFirebase(): Promise<void> {
  if (!_initPromise) {
    _initPromise = (async () => {
      const { initializeApp, getApps } = await import("firebase/app")
      const app =
        getApps().length === 0
          ? initializeApp(firebaseConfig)
          : getApps()[0]

      const { getAuth } = await import("firebase/auth")
      const { getDatabase } = await import("firebase/database")

      _auth = getAuth(app)
      _db = getDatabase(app)
    })()
  }
  return _initPromise
}

/** Synchronous getter – only call after initFirebase() has resolved. */
export function getFirebaseAuth(): Auth {
  if (!_auth) throw new Error("Firebase not initialised – wrap your app in <FirebaseProvider>")
  return _auth
}

/** Synchronous getter – only call after initFirebase() has resolved. */
export function getFirebaseDatabase(): Database {
  if (!_db) throw new Error("Firebase not initialised – wrap your app in <FirebaseProvider>")
  return _db
}
