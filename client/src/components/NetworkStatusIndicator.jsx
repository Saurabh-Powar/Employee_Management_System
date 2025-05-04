"use client"

import { useState, useEffect } from "react"
import "./NetworkStatusIndicatorS.css"

const NetworkStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    // Update network status
    const handleOnline = () => {
      setIsOnline(true)
      // Show the message briefly when coming back online
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowMessage(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initial check
    setIsOnline(navigator.onLine)
    if (!navigator.onLine) {
      setShowMessage(true)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showMessage) return null

  return (
    <div className={`network-status-indicator ${isOnline ? "online" : "offline"}`}>
      {isOnline ? (
        <div className="online-message">
          <span className="status-icon">✓</span>
          You're back online
        </div>
      ) : (
        <div className="offline-message">
          <span className="status-icon">!</span>
          You're offline. Some features may be unavailable.
        </div>
      )}
    </div>
  )
}

export default NetworkStatusIndicator
