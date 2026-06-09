'use client'

import { useEffect } from 'react'
import { updatePresence } from '@/app/actions/messages'

export function PresenceTracker() {
  useEffect(() => {
    updatePresence('online')

    const heartbeat = setInterval(() => {
      updatePresence('online')
    }, 60_000)

    function handleVisibility() {
      updatePresence(document.hidden ? 'away' : 'online')
    }

    function handleUnload() {
      updatePresence('offline')
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      clearInterval(heartbeat)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('beforeunload', handleUnload)
      updatePresence('offline')
    }
  }, [])

  return null
}
