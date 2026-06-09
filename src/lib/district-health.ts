import type {
  Goal,
  Intervention,
  SchoolHealth,
  SchoolWithStats,
} from '@/lib/database.types'
import { categoryLabels } from '@/lib/school-health'

export function computeDistrictHealth(schools: SchoolWithStats[]): SchoolHealth {
  if (schools.length === 0) return 'off_track'
  if (schools.some((s) => s.healthStatus === 'off_track')) return 'off_track'
  if (schools.some((s) => s.healthStatus === 'at_risk')) return 'at_risk'
  return 'healthy'
}

export function buildDistrictRecommendations(input: {
  district: string
  schools: SchoolWithStats[]
  goals: Pick<Goal, 'status' | 'category' | 'metric_name'>[]
  openInterventions: Pick<Intervention, 'issue' | 'school_id'>[]
  resolvedInterventions: number
  partnerCount: number
  teacherCount: number
}): string[] {
  const recs: string[] = []
  const health = computeDistrictHealth(input.schools)

  if (health === 'healthy') {
    recs.push('District is healthy — maintain current goal monitoring and celebrate wins with school leaders.')
    return recs
  }

  const offTrackSchools = input.schools.filter((s) => s.healthStatus === 'off_track')
  const atRiskSchools = input.schools.filter((s) => s.healthStatus === 'at_risk')

  if (offTrackSchools.length > 0) {
    recs.push(
      `Prioritize ${offTrackSchools.map((s) => s.name).join(', ')} — schedule executive check-ins within 2 weeks.`
    )
  }

  if (atRiskSchools.length > 0) {
    recs.push(
      `Watch ${atRiskSchools.map((s) => s.name).join(', ')} closely; assign regional support before metrics slip further.`
    )
  }

  const offTrackGoals = input.goals.filter((g) => g.status === 'off_track')
  if (offTrackGoals.length > 0) {
    const categories = [...new Set(offTrackGoals.map((g) => categoryLabels[g.category] ?? g.category))]
    recs.push(`Address off-track ${categories.join(', ')} goals — ${offTrackGoals.length} goal(s) need corrective action.`)
  }

  const atRiskGoals = input.goals.filter((g) => g.status === 'at_risk')
  if (atRiskGoals.length > 0) {
    recs.push(`Review ${atRiskGoals.length} at-risk goal(s) and update action plans with school administrators.`)
  }

  if (input.openInterventions.length > 0) {
    recs.push(
      `Close the loop on ${input.openInterventions.length} open intervention(s) with documented evidence of resolution.`
    )
  }

  if (input.partnerCount === 0) {
    recs.push('No partners linked in this district — consider consultants or vendors to support turnaround efforts.')
  } else if (input.partnerCount > 0 && offTrackSchools.length > 0) {
    recs.push('Leverage existing district partners for targeted support at struggling schools.')
  }

  if (input.teacherCount === 0) {
    recs.push('No teachers assigned in the system — verify staffing data and school assignments.')
  }

  const avgOnTrack =
    input.schools.reduce((sum, s) => sum + s.onTrackPercent, 0) /
    Math.max(input.schools.length, 1)

  if (avgOnTrack < 80) {
    recs.push(
      `Raise district on-track rate from ${Math.round(avgOnTrack)}% to 80%+ through weekly goal reviews.`
    )
  }

  if (recs.length === 0) {
    recs.push('Continue monitoring goals and interventions to sustain district health.')
  }

  return recs
}
