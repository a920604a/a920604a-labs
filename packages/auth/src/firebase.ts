import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

let app: FirebaseApp

export function initFirebase(config: FirebaseConfig): FirebaseApp {
  if (getApps().length === 0) {
    app = initializeApp(config)
  } else {
    app = getApps()[0]
  }
  return app
}

export function getFirebaseAuth() {
  return getAuth(app)
}

export function getFirebaseFirestore() {
  return getFirestore(app)
}
