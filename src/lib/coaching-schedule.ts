import type {
  CheckInFrequency,
  CoachingSupportLevel,
  TeachingEvaluation,
} from '@/lib/database.types'

export const evaluationFrequencyMap: Record<TeachingEvaluation, CheckInFrequency> = {
  needs_improvement: 'weekly',
  developing: 'biweekly',
  effective: 'monthly',
  exemplary: 'quarterly',
}

export const supportLevelFrequencyMap: Record<CoachingSupportLevel, CheckInFrequency> = {
  high: 'weekly',
  standard: 'biweekly',
  light: 'monthly',
}

export const frequencyLabels: Record<CheckInFrequency, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
}

export const supportLevelLabels: Record<CoachingSupportLevel, string> = {
  high: 'High',
  standard: 'Standard',
  light: 'Light',
}

export const evaluationLabels: Record<TeachingEvaluation, string> = {
  exemplary: 'Exemplary',
  effective: 'Effective',
  developing: 'Developing',
  needs_improvement: 'Needs improvement',
}

export const DEFAULT_CHECK_IN_COUNT = 6

export function frequencyFromEvaluation(
  evaluation: TeachingEvaluation | null | undefined
): CheckInFrequency {
  if (!evaluation) return 'biweekly'
  return evaluationFrequencyMap[evaluation]
}

export function frequencyFromSupportLevel(level: CoachingSupportLevel): CheckInFrequency {
  return supportLevelFrequencyMap[level]
}

export function addFrequencyInterval(date: Date, frequency: CheckInFrequency): Date {
  const next = new Date(date)
  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'biweekly':
      next.setDate(next.getDate() + 14)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'quarterly':
      next.setMonth(next.getMonth() + 3)
      break
  }
  return next
}

export function generateCheckInDates(
  startDate: Date,
  frequency: CheckInFrequency,
  count = DEFAULT_CHECK_IN_COUNT
): Date[] {
  const dates: Date[] = []
  let current = new Date(startDate)
  for (let i = 0; i < count; i++) {
    dates.push(new Date(current))
    current = addFrequencyInterval(current, frequency)
  }
  return dates
}

export function nextScheduledCheckIn(
  dates: Date[],
  from: Date = new Date()
): Date | null {
  const upcoming = dates.find((d) => d.getTime() >= from.getTime())
  return upcoming ?? dates[dates.length - 1] ?? null
}
