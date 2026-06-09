import { createClient } from '@/lib/supabase/server'
import type { CalendarEventItem, CalendarEventRecord } from '@/lib/database.types'

export async function getCalendarEvents(
  rangeStart: Date,
  rangeEnd: Date
): Promise<CalendarEventItem[]> {
  const supabase = await createClient()
  const startIso = rangeStart.toISOString()
  const endIso = rangeEnd.toISOString()

  const [customRes, pdRes, coachingRes, interventionRes] = await Promise.all([
    supabase
      .from('calendar_events')
      .select('*, schools(name)')
      .gte('start_at', startIso)
      .lte('start_at', endIso)
      .order('start_at', { ascending: true }),
    supabase
      .from('pd_events')
      .select('*')
      .eq('status', 'scheduled')
      .gte('start_date', startIso)
      .lte('start_date', endIso)
      .order('start_date', { ascending: true }),
    supabase
      .from('coaching_cycles')
      .select('*, schools(name)')
      .gte('start_date', rangeStart.toISOString().slice(0, 10))
      .lte('start_date', rangeEnd.toISOString().slice(0, 10)),
    supabase
      .from('interventions')
      .select('*, schools(name)')
      .gte('date', rangeStart.toISOString().slice(0, 10))
      .lte('date', rangeEnd.toISOString().slice(0, 10)),
  ])

  if (customRes.error) throw customRes.error
  if (pdRes.error) throw pdRes.error
  if (coachingRes.error) throw coachingRes.error
  if (interventionRes.error) throw interventionRes.error

  const items: CalendarEventItem[] = []

  for (const row of customRes.data ?? []) {
    const r = row as CalendarEventRecord & {
      schools: { name: string } | { name: string }[] | null
    }
    const school = Array.isArray(r.schools) ? r.schools[0] : r.schools
    items.push({
      id: `custom-${r.id}`,
      title: r.title,
      description: r.description,
      start_at: r.start_at,
      end_at: r.end_at,
      event_type: r.event_type,
      source: 'custom',
      school_name: school?.name ?? null,
      location: r.location,
    })
  }

  for (const row of pdRes.data ?? []) {
    const e = row as {
      id: string
      title: string
      description: string | null
      start_date: string
      end_date: string | null
      location: string | null
      format: string
    }
    items.push({
      id: `pd-${e.id}`,
      title: e.title,
      description: e.description,
      start_at: e.start_date,
      end_at: e.end_date,
      event_type: 'pd',
      source: 'pd',
      href: `/pd/${e.id}`,
      location: e.location,
    })
  }

  for (const row of coachingRes.data ?? []) {
    const c = row as {
      id: string
      focus_area: string
      start_date: string
      end_date: string | null
      schools: { name: string } | { name: string }[] | null
    }
    const school = Array.isArray(c.schools) ? c.schools[0] : c.schools
    items.push({
      id: `coaching-${c.id}`,
      title: `Coaching: ${c.focus_area}`,
      start_at: `${c.start_date}T09:00:00`,
      end_at: c.end_date ? `${c.end_date}T17:00:00` : null,
      event_type: 'coaching',
      source: 'coaching',
      href: `/coaching/${c.id}`,
      school_name: school?.name ?? null,
    })
  }

  for (const row of interventionRes.data ?? []) {
    const i = row as {
      id: string
      issue: string
      date: string
      schools: { name: string } | { name: string }[] | null
    }
    const school = Array.isArray(i.schools) ? i.schools[0] : i.schools
    items.push({
      id: `intervention-${i.id}`,
      title: `Intervention: ${i.issue}`,
      start_at: `${i.date}T12:00:00`,
      event_type: 'intervention',
      source: 'intervention',
      href: `/interventions`,
      school_name: school?.name ?? null,
    })
  }

  return items.sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  )
}
