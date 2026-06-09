import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { getPdEventById, getEventRegistrations, getUserRegistrations } from '@/lib/queries/pd'
import { getCurrentProfile } from '@/lib/queries/profile'
import { canManagePd } from '@/lib/permissions'
import { PdRegisterButton } from '@/components/pd/pd-register-button'
import { PdAssignDialog } from '@/components/pd/pd-assign-dialog'
import { PdRegistrationsList } from '@/components/pd/pd-registrations-list'
import { PdEventDetails } from '@/components/pd/pd-event-details'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'

export default async function PdEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [event, profile] = await Promise.all([
    getPdEventById(id),
    getCurrentProfile(),
  ])

  if (!event) notFound()

  const canManage = profile ? canManagePd(profile.role) : false
  const [userRegistrations, eventRegistrations] = await Promise.all([
    profile ? getUserRegistrations(profile.id) : Promise.resolve([]),
    canManage ? getEventRegistrations(id) : Promise.resolve([]),
  ])
  const myRegistration = userRegistrations.find((r) => r.event_id === id)
  const isRegistered = !!myRegistration
  const canViewMeetingDetails = isRegistered || canManage

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.title}
        subtitle={
          event.end_date
            ? `${format(new Date(event.start_date), 'EEEE, MMMM d, yyyy · h:mm a')} – ${format(new Date(event.end_date), 'h:mm a')}`
            : format(new Date(event.start_date), 'EEEE, MMMM d, yyyy · h:mm a')
        }
        actions={
          <div className="flex items-center gap-2">
            {canManage && event.status === 'scheduled' && (
              <PdAssignDialog eventId={id} eventTitle={event.title} trigger="Assign" />
            )}
            {!isRegistered && profile && event.status === 'scheduled' ? (
              <PdRegisterButton eventId={id} userId={profile.id} />
            ) : isRegistered ? (
              <div className="text-right">
                <Badge>Registered</Badge>
                {myRegistration?.assigned_by_name && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Assigned by {myRegistration.assigned_by_name}
                  </p>
                )}
              </div>
            ) : null}
          </div>
        }
      />

      <PdEventDetails event={event} canViewMeetingDetails={canViewMeetingDetails} />

      {event.description && (
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="font-heading font-semibold">Description</h3>
          <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
        </div>
      )}

      {canManage && (
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="font-heading font-semibold">Registrations</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {eventRegistrations.length} user(s) registered for this session
          </p>
          <div className="mt-4">
            <PdRegistrationsList registrations={eventRegistrations} />
          </div>
        </div>
      )}
    </div>
  )
}
