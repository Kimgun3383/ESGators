/**
 * Context manager for auth. Keeps user logged in during page refresh or new session.
 * 
 * Last Edit: Nicholas Sardinia, 3/1/2026
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { BACKEND_API_BASE_URL } from "../lib/api"
import { auth, isFirebaseConfigured } from "../lib/firebase"

const AuthContext = createContext(null)
const FIREBASE_PROMETHEUS_SYNC_INTERVAL_MS = 1000

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      setUser(null)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user?.uid) {
      return undefined
    }

    let ignore = false
    let syncInFlight = false

    const syncUserNodeMetrics = async () => {
      if (ignore || syncInFlight) {
        return
      }

      syncInFlight = true

      try {
        const response = await fetch(`${BACKEND_API_BASE_URL}/firebase/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ownerUid: user.uid,
          }),
        })

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}))
          throw new Error(
            errorPayload.detail || errorPayload.error || `HTTP ${response.status}`
          )
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to sync user Firebase metrics:", error)
        }
      } finally {
        syncInFlight = false
      }
    }

    syncUserNodeMetrics()

    const intervalId = window.setInterval(
      syncUserNodeMetrics,
      FIREBASE_PROMETHEUS_SYNC_INTERVAL_MS
    )

    return () => {
      ignore = true
      window.clearInterval(intervalId)
    }
  }, [user?.uid])

  const value = useMemo(() => ({ user, loading }), [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}

export { AuthProvider, useAuth }
