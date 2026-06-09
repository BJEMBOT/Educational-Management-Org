import { createClient } from '@/lib/supabase/server'
import type { CalendarEventItem, CalendarEventRecord } from '@/lib/database.types'

export async function getCalendarEvents(
  rangeStart: Date,
  rangeEnd: Date
): Promise<CalendarEventItem[]> {
  const supabase = await createClient()
  const startIso = rangeStart.toISOString()
  const endIso = rangeEnd.toISOString()

  const [customRes, pdRes, coachingRes, interventionRes, evaluationObsRes] =
    await Promise.all([
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
      .from('coaching_check_ins')
      .select('*, coaching_cycles(id, teacher_id, focus_area, schools(name))')
      .gte('scheduled_at', startIso)
      .lte('scheduled_at', endIso)
      .neq('status', 'cancelled')
      .order('scheduled_at', { ascending: true }),
    supabase
      .from('interventions')
      .select('*, schools(name)')
      .gte('date', rangeStart.toISOString().slice(0, 10))
      .lte('date', rangeEnd.toISOString().slice(0, 10)),
    supabase
      .from('observations')
      .select('*, evaluation_cycles(id, teacher_id, schools(name))')
      .not('evaluation_cycle_id', 'is', null)
      .gte('observation_date', startIso)
      .lte('observation_date', endIso)
      .order('observation_date', { ascending: true }),
  ])

  if (customRes.error) throw customRes.error
  if (pdRes.error) throw pdRes.error
  if (coachingRes.error) throw coachingRes.error
  if (interventionRes.error) throw interventionRes.error
  if (evaluationObsRes.error) throw evaluationObsRes.error

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

  const teacherIds = [
    ...new Set(
      (coachingRes.data ?? []).map((row) => {
        const r = row as {
          coaching_cycles:
            | { teacher_id: string }
            | { teacher_id: string }[]
            | null
        }
        const cycle = Array.isArray(r.coaching_cycles)
          ? r.coaching_cycles[0]
          : r.coaching_cycles
        return cycle?.teacher_id
      }).filter(Boolean) as string[]
    ),
  ]

  const teacherNameMap = new Map<string, string>()
  if (teacherIds.length > 0) {
    const { data: teachers } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', teacherIds)
    for (const t of teachers ?? []) {
      teacherNameMap.set(t.id, t.name ?? 'Teacher')
    }
  }

  for (const row of coachingRes.data ?? []) {
    const r = row as {
      id: string
      scheduled_at: string
      status: string
      coaching_cycles:
        | {
            id: string
            teacher_id: string
            focus_area: string
            schools: { name: string } | { name: string }[] | null
          }
        | {
            id: string
            teacher_id: string
            focus_area: string
            schools: { name: string } | { name: string }[] | null
          }[]
        | null
    }
    const cycle = Array.isArray(r.coaching_cycles)
      ? r.coaching_cycles[0]
      : r.coaching_cycles
    if (!cycle) continue

    const school = Array.isArray(cycle.schools) ? cycle.schools[0] : cycle.schools
    const teacherName = teacherNameMap.get(cycle.teacher_id) ?? 'Teacher'

    items.push({
      id: `coaching-checkin-${r.id}`,
      title: `Coaching check-in: ${teacherName}`,
      description: cycle.focus_area,
      start_at: r.scheduled_at,
      end_at: null,
      event_type: 'coaching',
      source: 'coaching',
      href: `/coaching/${cycle.id}`,
      school_name: school?.name ?? null,
    })
  }

  const evalTeacherIds = [
    ...new Set(
      (evaluationObsRes.data ?? [])
        .map((row) => {
          const r = row as {
            evaluation_cycles:
              | { teacher_id: string }
              | { teacher_id: string }[]
              | null
          }
          const cycle = Array.isArray(r.evaluation_cycles)
            ? r.evaluation_cycles[0]
            : r.evaluation_cycles
          return cycle?.teacher_id
        })
        .filter(Boolean) as string[]
    ),
  ]

  for (const tid of evalTeacherIds) {
    if (!teacherNameMap.has(tid)) {
      const { data: t } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', tid)
        .single()
      if (t) teacherNameMap.set(t.id, t.name ?? 'Teacher')
    }
  }

  for (const row of evaluationObsRes.data ?? []) {
    const r = row as {
      id: string
      observation_date: string
      observation_type: string
      evaluation_cycle_id: string
      evaluation_cycles:
        | {
            id: string
            teacher_id: string
            schools: { name: string } | { name: string }[] | null
          }
        | {
            id: string
            teacher_id: string
            schools: { name: string } | { name: string }[] | null
          }[]
        | null
    }
    const cycle = Array.isArray(r.evaluation_cycles)
      ? r.evaluation_cycles[0]
      : r.evaluation_cycles
    if (!cycle) continue

    const school = Array.isArray(cycle.schools) ? cycle.schools[0] : cycle.schools
    const teacherName = teacherNameMap.get(cycle.teacher_id) ?? 'Teacher'

    items.push({
      id: `evaluation-obs-${r.id}`,
      title: `Evaluation ${r.observation_type}: ${teacherName}`,
      start_at: r.observation_date,
      event_type: 'evaluation',
      source: 'evaluation',
      href: `/evaluations/${r.evaluation_cycle_id}`,
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
