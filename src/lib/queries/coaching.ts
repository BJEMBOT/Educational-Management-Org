import { createClient } from '@/lib/supabase/server'
import { frequencyFromEvaluation } from '@/lib/coaching-schedule'
import type {
  CoachingCheckIn,
  CoachingCycle,
  CoachingCycleWithDetails,
  CoachingLog,
  Observation,
  Profile,
  TeachingEvaluation,
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
  if (error) throw new Error(error.message)

  const cycles = data ?? []
  const profileIds = [
    ...new Set(cycles.flatMap((c) => [c.coach_id, c.teacher_id])),
  ]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', profileIds)

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.name ?? 'Unknown']))

  const cycleIds = cycles.map((c) => c.id)
  const observationCountByCycle = new Map<string, number>()

  if (cycleIds.length > 0) {
    const { data: observations, error: obsError } = await supabase
      .from('observations')
      .select('cycle_id')
      .in('cycle_id', cycleIds)

    if (obsError) throw new Error(obsError.message)
    for (const obs of observations ?? []) {
      observationCountByCycle.set(
        obs.cycle_id,
        (observationCountByCycle.get(obs.cycle_id) ?? 0) + 1
      )
    }
  }

  return cycles.map((c) => {
    const row = c as CoachingCycle & { schools: { name: string } }
    return {
      ...row,
      school_name: row.schools.name,
      coach_name: nameMap.get(row.coach_id) ?? 'Unknown',
      teacher_name: nameMap.get(row.teacher_id) ?? 'Unknown',
      observation_count: observationCountByCycle.get(row.id) ?? 0,
    }
  })
}

export async function getCoachingCycleById(id: string) {
  const supabase = await createClient()
  const [cycleRes, obsRes, logsRes, checkInsRes] = await Promise.all([
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
    supabase
      .from('coaching_check_ins')
      .select('*')
      .eq('cycle_id', id)
      .order('scheduled_at', { ascending: true }),
  ])

  if (cycleRes.error || !cycleRes.data) return null

  const c = cycleRes.data as CoachingCycle & { schools: { name: string } }
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, teaching_evaluation')
    .in('id', [c.coach_id, c.teacher_id])

  const profileMap = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      {
        name: p.name ?? 'Unknown',
        teaching_evaluation: p.teaching_evaluation as TeachingEvaluation | null,
      },
    ])
  )

  const teacherProfile = profileMap.get(c.teacher_id)

  return {
    cycle: {
      ...c,
      school_name: c.schools.name,
      coach_name: profileMap.get(c.coach_id)?.name ?? 'Unknown',
      teacher_name: teacherProfile?.name ?? 'Unknown',
      teacher_evaluation: teacherProfile?.teaching_evaluation ?? null,
    },
    observations: (obsRes.data ?? []) as Observation[],
    logs: (logsRes.data ?? []) as CoachingLog[],
    checkIns: (checkInsRes.data ?? []) as CoachingCheckIn[],
  }
}

export async function getCheckInsForCycle(cycleId: string): Promise<CoachingCheckIn[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('coaching_check_ins')
    .select('*')
    .eq('cycle_id', cycleId)
    .order('scheduled_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getNextCheckInForTeacher(
  teacherId: string
): Promise<{ scheduled_at: string; cycle_id: string } | null> {
  const supabase = await createClient()
  const { data: cycles } = await supabase
    .from('coaching_cycles')
    .select('id')
    .eq('teacher_id', teacherId)
    .eq('status', 'active')

  const cycleIds = (cycles ?? []).map((c) => c.id)
  if (cycleIds.length === 0) return null

  const { data, error } = await supabase
    .from('coaching_check_ins')
    .select('scheduled_at, cycle_id')
    .in('cycle_id', cycleIds)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export function getDefaultFrequencyForTeacher(
  evaluation: TeachingEvaluation | null | undefined
) {
  return frequencyFromEvaluation(evaluation)
}

export function summarizeCoachingCycles(
  cycles: Awaited<ReturnType<typeof getCoachingCycles>>
) {
  return {
    active: cycles.filter((c) => c.status === 'active').length,
    total: cycles.length,
    teachers: new Set(cycles.map((c) => c.teacher_id)).size,
  }
}

export async function getCoachingSummary(coachId: string) {
  const cycles = await getCoachingCycles({ coachId })
  return summarizeCoachingCycles(cycles)
}

export async function getProfilesByRole(role: string): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('profiles').select('*').eq('role', role)
  if (error) throw new Error(error.message)
  return (data ?? []) as Profile[]
}

export async function getCoachProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['coach', 'consultant', 'admin', 'developer', 'regional_manager'])
    .order('name')

  if (error) throw new Error(error.message)
  return (data ?? []) as Profile[]
}
