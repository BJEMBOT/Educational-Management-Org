'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  cancelCheckIn,
  completeCheckIn,
  deleteCheckIn,
  rescheduleCheckIn,
} from '@/app/actions/coaching'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { frequencyLabels } from '@/lib/coaching-schedule'
import type {
  CheckInFrequency,
  CoachingCheckIn,
  CoachingCheckInStatus,
  FrequencySource,
} from '@/lib/database.types'

const statusVariant: Record<
  CoachingCheckInStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  scheduled: 'secondary',
  completed: 'default',
  cancelled: 'outline',
  missed: 'destructive',
}

export function CoachingCheckInsPanel({
  checkIns,
  frequency,
  frequencySource,
  canWrite,
  canDelete,
}: {
  checkIns: CoachingCheckIn[]
  frequency: CheckInFrequency
  frequencySource: FrequencySource
  canWrite: boolean
  canDelete?: boolean
}) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')

  async function handleComplete(id: string) {
    setLoadingId(id)
    const result = await completeCheckIn(id)
    setLoadingId(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Check-in marked complete')
    router.refresh()
  }

  async function handleCancel(id: string) {
    setLoadingId(id)
    const result = await cancelCheckIn(id)
    setLoadingId(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Check-in cancelled')
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Permanently delete this check-in from the schedule?')) return
    setLoadingId(id)
    const result = await deleteCheckIn(id)
    setLoadingId(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Check-in deleted')
    router.refresh()
  }

  async function handleReschedule(id: string) {
    if (!rescheduleDate) {
      toast.error('Pick a new date and time')
      return
    }
    setLoadingId(id)
    const result = await rescheduleCheckIn(id, rescheduleDate)
    setLoadingId(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Check-in rescheduled')
    setRescheduleId(null)
    setRescheduleDate('')
    router.refresh()
  }

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-heading font-semibold">Upcoming Check-ins</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {frequencyLabels[frequency]} ·{' '}
            {frequencySource === 'evaluation_default'
              ? 'Based on teacher evaluation'
              : 'Custom schedule'}
          </p>
        </div>
        <Link href="/calendar">
          <Button variant="outline" size="sm">
            View calendar
          </Button>
        </Link>
      </div>

      <ul className="mt-4 space-y-2">
        {checkIns.length === 0 ? (
          <li className="text-sm text-muted-foreground">No check-ins scheduled yet.</li>
        ) : (
          checkIns.map((checkIn) => (
            <li
              key={checkIn.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium">
                  {format(new Date(checkIn.scheduled_at), 'EEEE, MMM d, yyyy · h:mm a')}
                </p>
                {checkIn.notes && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{checkIn.notes}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant[checkIn.status]} className="capitalize text-xs">
                  {checkIn.status}
                </Badge>
                {canWrite && checkIn.status === 'scheduled' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loadingId === checkIn.id}
                      onClick={() => handleComplete(checkIn.id)}
                    >
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={loadingId === checkIn.id}
                      onClick={() => {
                        setRescheduleId(checkIn.id)
                        setRescheduleDate(checkIn.scheduled_at.slice(0, 16))
                      }}
                    >
                      Reschedule
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={loadingId === checkIn.id}
                      onClick={() => handleCancel(checkIn.id)}
                    >
                      Cancel
                    </Button>
                    {canDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={loadingId === checkIn.id}
                        onClick={() => handleDelete(checkIn.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </>
                )}
              </div>
              {rescheduleId === checkIn.id && (
                <div className="flex w-full flex-wrap items-center gap-2 border-t pt-2">
                  <Input
                    type="datetime-local"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button size="sm" onClick={() => handleReschedule(checkIn.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRescheduleId(null)}
                  >
                    Close
                  </Button>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
