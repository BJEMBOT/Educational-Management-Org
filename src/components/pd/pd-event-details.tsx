import { format } from 'date-fns'
import { ExternalLink, MapPin, User, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PdEvent } from '@/lib/database.types'

const formatLabels: Record<string, string> = {
  in_person: 'In Person',
  virtual: 'Virtual',
  hybrid: 'Hybrid',
}

export function PdEventDetails({
  event,
  canViewMeetingDetails,
}: {
  event: PdEvent
  canViewMeetingDetails: boolean
}) {
  const hasVirtualInfo =
    event.meeting_url || event.meeting_id || event.meeting_passcode || event.join_instructions
  const showVirtual = canViewMeetingDetails && hasVirtualInfo

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Credit Hours</p>
          <p className="mt-1 text-2xl font-semibold">{event.credit_hours}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Format</p>
          <p className="mt-1 text-lg font-medium">
            {formatLabels[event.format] ?? event.format}
          </p>
        </div>
        {event.facilitator && (
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Facilitator</p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-medium">
              <User className="h-4 w-4 text-muted-foreground" />
              {event.facilitator}
            </p>
          </div>
        )}
        {(event.location || event.format !== 'virtual') && (
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Location</p>
            <p className="mt-1 flex items-start gap-1.5 text-lg font-medium">
              {event.location ? (
                <>
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  {event.location}
                </>
              ) : (
                'TBD'
              )}
            </p>
          </div>
        )}
      </div>

      {event.end_date && (
        <p className="text-sm text-muted-foreground">
          {format(new Date(event.start_date), 'h:mm a')} – {format(new Date(event.end_date), 'h:mm a')}
        </p>
      )}

      {showVirtual && (
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 font-heading font-semibold">
              <Video className="h-4 w-4" />
              Join Session
            </h3>
            {event.meeting_url && (
              <a href={event.meeting_url} target="_blank" rel="noopener noreferrer">
                <Button size="sm">
                  Open Meeting
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {event.meeting_url && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Meeting Link</dt>
                <dd className="mt-0.5 break-all">
                  <a
                    href={event.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {event.meeting_url}
                  </a>
                </dd>
              </div>
            )}
            {event.meeting_id && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Meeting ID</dt>
                <dd className="mt-0.5 font-mono">{event.meeting_id}</dd>
              </div>
            )}
            {event.meeting_passcode && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Passcode</dt>
                <dd className="mt-0.5 font-mono">{event.meeting_passcode}</dd>
              </div>
            )}
          </dl>
          {event.join_instructions && (
            <div className="mt-4 rounded-md bg-muted/50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Join Instructions</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{event.join_instructions}</p>
            </div>
          )}
        </div>
      )}

      {!canViewMeetingDetails && hasVirtualInfo && (
        <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-center text-sm text-muted-foreground">
          Register for this session to view the meeting link and join details.
        </div>
      )}

      {canViewMeetingDetails && event.materials_url && (
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="font-heading font-semibold">Materials</h3>
          <a
            href={event.materials_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            View session materials
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  )
}
