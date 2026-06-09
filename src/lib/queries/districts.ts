import { createClient } from '@/lib/supabase/server'
import {
  buildDistrictRecommendations,
  computeDistrictHealth,
} from '@/lib/district-health'
import type {
  GoalWithSchool,
  InterventionWithSchool,
  PartnerWithSchools,
  SchoolWithStats,
} from '@/lib/database.types'

export interface DistrictTeacher {
  id: string
  name: string | null
  school_id: string
  school_name: string
}

export interface DistrictDetail {
  district: string
  schools: SchoolWithStats[]
  healthStatus: ReturnType<typeof computeDistrictHealth>
  totalEnrollment: number
  healthyCount: number
  atRiskCount: number
  offTrackCount: number
  openInterventionCount: number
  resolvedInterventionCount: number
  goals: GoalWithSchool[]
  interventions: InterventionWithSchool[]
  partners: PartnerWithSchools[]
  teachers: DistrictTeacher[]
  recommendations: string[]
}

export async function getTeachersBySchool(): Promise<DistrictTeacher[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_school_assignments')
    .select('school_id, user_id, schools(name), profiles(name, role)')

  if (error) throw error

  return (data ?? [])
    .map((row) => {
      const r = row as {
        school_id: string
        user_id: string
        schools: { name: string } | { name: string }[] | null
        profiles: { name: string | null; role: string } | { name: string | null; role: string }[] | null
      }
      const school = Array.isArray(r.schools) ? r.schools[0] : r.schools
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
      return {
        id: r.user_id,
        name: profile?.name ?? null,
        role: profile?.role,
        school_id: r.school_id,
        school_name: school?.name ?? 'Unknown',
      }
    })
    .filter((t) => t.role === 'teacher')
    .map(({ role: _r, ...t }) => t)
}

export function buildDistrictDetails(input: {
  schools: SchoolWithStats[]
  goals: GoalWithSchool[]
  interventions: InterventionWithSchool[]
  partners: PartnerWithSchools[]
  teachers: DistrictTeacher[]
}): DistrictDetail[] {
  const districts = [...new Set(input.schools.map((s) => s.district))].sort()

  const healthOrder = { off_track: 0, at_risk: 1, healthy: 2 } as const

  return districts.map((district) => {
    const districtSchools = input.schools.filter((s) => s.district === district)
    const schoolIds = new Set(districtSchools.map((s) => s.id))
    const schoolNames = new Set(districtSchools.map((s) => s.name))

    const districtGoals = input.goals.filter((g) => schoolIds.has(g.school_id))
    const districtInterventions = input.interventions.filter((i) =>
      schoolIds.has(i.school_id)
    )
    const districtPartners = input.partners.filter((p) =>
      p.school_names.some((name) => schoolNames.has(name))
    )
    const districtTeachers = input.teachers.filter((t) => schoolIds.has(t.school_id))

    const openInterventions = districtInterventions.filter((i) => i.status === 'open')
    const resolvedInterventions = districtInterventions.filter(
      (i) => i.status === 'resolved'
    )

    return {
      district,
      schools: districtSchools,
      healthStatus: computeDistrictHealth(districtSchools),
      totalEnrollment: districtSchools.reduce((sum, s) => sum + s.enrollment, 0),
      healthyCount: districtSchools.filter((s) => s.healthStatus === 'healthy').length,
      atRiskCount: districtSchools.filter((s) => s.healthStatus === 'at_risk').length,
      offTrackCount: districtSchools.filter((s) => s.healthStatus === 'off_track').length,
      openInterventionCount: openInterventions.length,
      resolvedInterventionCount: resolvedInterventions.length,
      goals: districtGoals,
      interventions: districtInterventions,
      partners: districtPartners,
      teachers: districtTeachers,
      recommendations: buildDistrictRecommendations({
        district,
        schools: districtSchools,
        goals: districtGoals,
        openInterventions,
        resolvedInterventions: resolvedInterventions.length,
        partnerCount: districtPartners.length,
        teacherCount: districtTeachers.length,
      }),
    }
  }).sort((a, b) => {
    const healthDiff = healthOrder[a.healthStatus] - healthOrder[b.healthStatus]
    if (healthDiff !== 0) return healthDiff
    return b.openInterventionCount - a.openInterventionCount
  })
}
