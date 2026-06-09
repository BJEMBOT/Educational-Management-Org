'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, MessageCircleOff } from 'lucide-react'
import { toast } from 'sonner'
import { setChatAvailability } from '@/app/actions/messages'
import { PresenceDot, presenceLabel } from '@/components/messages/presence-dot'
import { Button } from '@/components/ui/button'
import type { PresenceStatus } from '@/lib/database.types'

export function ChatAvailabilityToggle({
  status,
  availableToChat,
}: {
  status: PresenceStatus
  availableToChat: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const effectiveStatus = status === 'offline' ? 'offline' : status
  const [available, setAvailable] = useState(availableToChat)

  async function toggle() {
    setLoading(true)
    const next = !available
    const result = await setChatAvailability(next)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setAvailable(next)
    toast.success(next ? 'You are available to chat' : 'You are no longer available to chat')
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-2">
        <PresenceDot status={effectiveStatus} availableToChat={available} />
        <div>
          <p className="text-sm font-medium">Your status</p>
          <p className="text-xs text-muted-foreground">
            {presenceLabel(effectiveStatus, available)}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant={available ? 'default' : 'outline'}
        onClick={toggle}
        disabled={loading || effectiveStatus === 'offline'}
      >
        {available ? (
          <>
            <MessageCircleOff className="mr-2 h-4 w-4" />
            Go unavailable
          </>
        ) : (
          <>
            <MessageCircle className="mr-2 h-4 w-4" />
            Available to chat
          </>
        )}
      </Button>
    </div>
  )
}
