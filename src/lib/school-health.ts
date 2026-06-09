import type { Goal, GoalStatus, SchoolHealth } from '@/lib/database.types'

export function computeSchoolHealth(goals: Pick<Goal, 'status'>[]): SchoolHealth {
  if (goals.length === 0) return 'off_track'

  const onTrackPct =
    goals.filter((g) => g.status === 'on_track').length / goals.length

  if (onTrackPct >= 0.8) return 'healthy'
  if (onTrackPct >= 0.6) return 'at_risk'
  return 'off_track'
}

export function computeOnTrackPercent(goals: Pick<Goal, 'status'>[]): number {
  if (goals.length === 0) return 0
  return Math.round(
    (goals.filter((g) => g.status === 'on_track').length / goals.length) * 100
  )
}

export const healthLabels: Record<SchoolHealth, string> = {
  healthy: 'Healthy',
  at_risk: 'At Risk',
  off_track: 'Off Track',
}

export const goalStatusLabels: Record<GoalStatus, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  off_track: 'Off Track',
}

export const categoryLabels: Record<string, string> = {
  academic: 'Academic',
  financial: 'Financial',
  staffing: 'Staffing',
  operations: 'Operations',
}
