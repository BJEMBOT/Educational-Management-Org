import { createClient } from '@/lib/supabase/server'
import type {
  CoachingCycle,
  CoachingCycleWithDetails,
  CoachingLog,
  Observation,
} from '@/lib/database.types'

export async function getCoachingCycles(filters?: {
  coachId?: string
  teacherId?: string
}): Promise<CoachingCycleWithDetails[]> {
  const supabase = await createClient()
  let query = supabase
    .from('coaching_cycles')
    .select('*, schools(name)')
    .order('created_at', { ascending: false })

  if (filters?.coachId) query = query.eq('coach_id', filters.coachId)
  if (filters?.teacherId) query = query.eq('teacher_id', filters.teacherId)

  const { data, error } = await query
  if (error) throw error

  const cycles = data ?? []
  const profileIds = [
    ...new Set(cycles.flatMap((c) => [c.coach_id, c.teacher_id])),
  ]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', profileIds)

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.name ?? 'Unknown']))

  return Promise.all(
    cycles.map(async (c) => {
      const row = c as CoachingCycle & { schools: { name: string } }
      const { count } = await supabase
        .from('observations')
        .select('*', { count: 'exact', head: true })
        .eq('cycle_id', row.id)
      return {
        ...row,
        school_name: row.schools.name,
        coach_name: nameMap.get(row.coach_id) ?? 'Unknown',
        teacher_name: nameMap.get(row.teacher_id) ?? 'Unknown',
        observation_count: count ?? 0,
      }
    })
  )
}

export async function getCoachingCycleById(id: string) {
  const supabase = await createClient()
  const [cycleRes, obsRes, logsRes] = await Promise.all([
    supabase.from('coaching_cycles').select('*, schools(name)').eq('id', id).single(),
    supabase
      .from('observations')
      .select('*')
      .eq('cycle_id', id)
      .order('observation_date', { ascending: false }),
    supabase
      .from('coaching_logs')
      .select('*')
      .eq('cycle_id', id)
      .order('log_date', { ascending: false }),
  ])

  if (cycleRes.error || !cycleRes.data) return null

  const c = cycleRes.data as CoachingCycle & { schools: { name: string } }
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', [c.coach_id, c.teacher_id])

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.name ?? 'Unknown']))

  return {
    cycle: {
      ...c,
      school_name: c.schools.name,
      coach_name: nameMap.get(c.coach_id) ?? 'Unknown',
      teacher_name: nameMap.get(c.teacher_id) ?? 'Unknown',
    },
    observations: (obsRes.data ?? []) as Observation[],
    logs: (logsRes.data ?? []) as CoachingLog[],
  }
}

export async function getCoachingSummary(coachId: string) {
  const cycles = await getCoachingCycles({ coachId })
  return {
    active: cycles.filter((c) => c.status === 'active').length,
    total: cycles.length,
    teachers: new Set(cycles.map((c) => c.teacher_id)).size,
  }
}

export async function getProfilesByRole(role: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').eq('role', role)
  return data ?? []
}
