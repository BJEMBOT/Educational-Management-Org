import { cn } from '@/lib/utils'
import type { PresenceStatus } from '@/lib/database.types'

export type PresenceDisplay = 'available' | 'online' | 'away' | 'offline'

export function getPresenceDisplay(
  status: PresenceStatus,
  availableToChat: boolean
): PresenceDisplay {
  if (status === 'offline') return 'offline'
  if (status === 'away') return 'away'
  if (availableToChat) return 'available'
  return 'online'
}

const displayStyles: Record<PresenceDisplay, string> = {
  available: 'bg-emerald-500',
  online: 'bg-sky-400',
  away: 'bg-amber-400',
  offline: 'bg-gray-300',
}

const displayLabels: Record<PresenceDisplay, string> = {
  available: 'Available to chat',
  online: 'Online',
  away: 'Away',
  offline: 'Offline',
}

export function PresenceDot({
  status,
  availableToChat = false,
  className,
}: {
  status: PresenceStatus
  availableToChat?: boolean
  className?: string
}) {
  const display = getPresenceDisplay(status, availableToChat)
  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background',
        displayStyles[display],
        className
      )}
      title={displayLabels[display]}
    />
  )
}

export function presenceLabel(
  status: PresenceStatus,
  availableToChat: boolean
): string {
  return displayLabels[getPresenceDisplay(status, availableToChat)]
}
