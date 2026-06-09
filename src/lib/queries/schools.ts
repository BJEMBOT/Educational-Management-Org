import { createClient } from '@/lib/supabase/server'
import {
  computeOnTrackPercent,
  computeSchoolHealth,
} from '@/lib/school-health'
import type { Goal, Intervention, School, SchoolWithStats } from '@/lib/database.types'

export async function getSchools(): Promise<School[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getSchoolById(id: string): Promise<School | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getSchoolsWithGoalStats(): Promise<SchoolWithStats[]> {
  const supabase = await createClient()

  const [schoolsRes, goalsRes, interventionsRes] = await Promise.all([
    supabase.from('schools').select('*').order('name'),
    supabase.from('goals').select('school_id, status'),
    supabase
      .from('interventions')
      .select('school_id, status')
      .eq('status', 'open'),
  ])

  if (schoolsRes.error) throw schoolsRes.error
  if (goalsRes.error) throw goalsRes.error
  if (interventionsRes.error) throw interventionsRes.error

  const goalsBySchool = new Map<string, Pick<Goal, 'status'>[]>()
  for (const goal of goalsRes.data ?? []) {
    const existing = goalsBySchool.get(goal.school_id) ?? []
    existing.push({ status: goal.status })
    goalsBySchool.set(goal.school_id, existing)
  }

  const openInterventionsBySchool = new Map<string, number>()
  for (const intervention of interventionsRes.data ?? []) {
    openInterventionsBySchool.set(
      intervention.school_id,
      (openInterventionsBySchool.get(intervention.school_id) ?? 0) + 1
    )
  }

  return (schoolsRes.data ?? []).map((school) => {
    const schoolGoals = goalsBySchool.get(school.id) ?? []
    const onTrackCount = schoolGoals.filter((g) => g.status === 'on_track').length

    return {
      ...school,
      totalGoals: schoolGoals.length,
      onTrackCount,
      onTrackPercent: computeOnTrackPercent(schoolGoals),
      healthStatus: computeSchoolHealth(schoolGoals),
      openInterventions: openInterventionsBySchool.get(school.id) ?? 0,
    }
  })
}

export async function getSchoolDetail(id: string) {
  const supabase = await createClient()

  const [schoolRes, goalsRes, interventionsRes] = await Promise.all([
    supabase.from('schools').select('*').eq('id', id).single(),
    supabase
      .from('goals')
      .select('*')
      .eq('school_id', id)
      .order('category'),
    supabase
      .from('interventions')
      .select('*')
      .eq('school_id', id)
      .order('date', { ascending: false }),
  ])

  if (schoolRes.error || !schoolRes.data) return null

  const goals = (goalsRes.data ?? []) as Goal[]
  const interventions = (interventionsRes.data ?? []) as Intervention[]

  return {
    school: schoolRes.data as School,
    goals,
    interventions,
    healthStatus: computeSchoolHealth(goals),
    onTrackPercent: computeOnTrackPercent(goals),
    openInterventions: interventions.filter((i) => i.status === 'open').length,
  }
}

export async function getSchoolsNeedingAttention(
  limit = 5
): Promise<SchoolWithStats[]> {
  const schools = await getSchoolsWithGoalStats()
  return schools
    .filter((s) => s.healthStatus !== 'healthy')
    .sort((a, b) => a.onTrackPercent - b.onTrackPercent)
    .slice(0, limit)
}

export async function getDashboardSummary() {
  const schools = await getSchoolsWithGoalStats()
  return {
    totalSchools: schools.length,
    healthyCount: schools.filter((s) => s.healthStatus === 'healthy').length,
    atRiskCount: schools.filter((s) => s.healthStatus === 'at_risk').length,
    offTrackCount: schools.filter((s) => s.healthStatus === 'off_track').length,
    openInterventions: schools.reduce((sum, s) => sum + s.openInterventions, 0),
  }
}
