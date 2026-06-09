import { addMonths, endOfMonth, startOfMonth, subMonths } from 'date-fns'
import { getCurrentProfile } from '@/lib/queries/profile'
import { getCalendarEvents } from '@/lib/queries/calendar'
import { getSchools } from '@/lib/queries/schools'
import { SharedCalendar } from '@/components/calendar/shared-calendar'
import { CalendarEventForm } from '@/components/calendar/calendar-event-form'
import { canManageCalendar } from '@/lib/permissions'
import { PageHeader } from '@/components/ui/page-header'

export default async function CalendarPage() {
  const profile = await getCurrentProfile()
  const now = new Date()
  const rangeStart = startOfMonth(subMonths(now, 2))
  const rangeEnd = endOfMonth(addMonths(now, 4))

  const [events, schools] = await Promise.all([
    getCalendarEvents(rangeStart, rangeEnd),
    getSchools(),
  ])

  const canManage = profile ? canManageCalendar(profile.role) : false

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
