import { addMonths, endOfMonth, startOfMonth, subMonths } from 'date-fns'
import { getCurrentProfile } from '@/lib/queries/profile'
import { getCalendarEvents } from '@/lib/queries/calendar'
import { getSchools } from '@/lib/queries/schools'
import { SharedCalendar } from '@/components/calendar/shared-calendar'
import { CalendarEventForm } from '@/components/calendar/calendar-event-form'
import { PageHeader } from '@/components/ui/page-header'

const MANAGE_ROLES = ['admin', 'regional_manager', 'staff', 'coach', 'consultant', 'developer']

export default async function CalendarPage() {
  const profile = await getCurrentProfile()
  const now = new Date()
  const rangeStart = startOfMonth(subMonths(now, 2))
  const rangeEnd = endOfMonth(addMonths(now, 4))

  const [events, schools] = await Promise.all([
    getCalendarEvents(rangeStart, rangeEnd),
    getSchools(),
  ])

  const canManage = profile && MANAGE_ROLES.includes(profile.role)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shared Calendar"
        subtitle="PD sessions, coaching cycles, interventions, and network events in one view"
        actions={canManage ? <CalendarEventForm schools={schools} /> : undefined}
      />
      <SharedCalendar events={events} />
    </div>
  )
}
