import type { RubricRating, TeachingEvaluation } from '@/lib/database.types'

export const ratingLabels: Record<RubricRating, string> = {
  exemplary: 'Exemplary',
  effective: 'Effective',
  developing: 'Developing',
  needs_improvement: 'Needs improvement',
}

export const ratingNumericMap: Record<RubricRating, number> = {
  exemplary: 4,
  effective: 3,
  developing: 2,
  needs_improvement: 1,
}

export const numericToRating = (avg: number): TeachingEvaluation => {
  if (avg >= 3.5) return 'exemplary'
  if (avg >= 2.5) return 'effective'
  if (avg >= 1.5) return 'developing'
  return 'needs_improvement'
}

export interface RubricIndicator {
  id: string
  domain_id: string
  code: string
  description: string
  sort_order: number
}

export interface RubricDomain {
  id: string
  framework_id: string
  name: string
  sort_order: number
  indicators: RubricIndicator[]
}

export interface DomainScore {
  domain_id: string
  domain_name: string
  average: number
  rating: TeachingEvaluation
  indicator_count: number
}

export interface AggregatedRubricScores {
  domains: DomainScore[]
  overall_average: number
  overall_rating: TeachingEvaluation
}

export function aggregateScores(
  scores: { indicator_id: string; domain_id: string; domain_name: string; rating: RubricRating }[]
): AggregatedRubricScores {
  const domainMap = new Map<string, { name: string; values: number[] }>()

  for (const s of scores) {
    const entry = domainMap.get(s.domain_id) ?? { name: s.domain_name, values: [] }
    entry.values.push(ratingNumericMap[s.rating])
    domainMap.set(s.domain_id, entry)
  }

  const domains: DomainScore[] = []
  for (const [domainId, { name, values }] of domainMap) {
    const average = values.reduce((a, b) => a + b, 0) / values.length
    domains.push({
      domain_id: domainId,
      domain_name: name,
      average: Math.round(average * 100) / 100,
      rating: numericToRating(average),
      indicator_count: values.length,
    })
  }

  domains.sort((a, b) => a.domain_name.localeCompare(b.domain_name))

  const allValues = scores.map((s) => ratingNumericMap[s.rating])
  const overallAverage =
    allValues.length > 0
      ? Math.round((allValues.reduce((a, b) => a + b, 0) / allValues.length) * 100) / 100
      : 0

  return {
    domains,
    overall_average: overallAverage,
    overall_rating: numericToRating(overallAverage),
  }
}

export function buildRatingsSnapshot(
  scores: { indicator_id: string; code: string; rating: RubricRating }[]
): Record<string, number> {
  const snapshot: Record<string, number> = {}
  for (const s of scores) {
    snapshot[s.indicator_id] = ratingNumericMap[s.rating]
    snapshot[s.code] = ratingNumericMap[s.rating]
  }
  return snapshot
}

export const cycleTypeLabels = {
  quarterly: 'Quarterly',
  semester: 'Semester',
  annual: 'Annual',
} as const

export const cycleStatusLabels = {
  draft: 'Draft',
  active: 'Active',
  mid_year_review: 'Mid-year review',
  completed: 'Completed',
  archived: 'Archived',
} as const

export const artifactTypeLabels = {
  lesson_plan: 'Lesson plan',
  assessment: 'Assessment',
  student_work: 'Student work',
  pd_certificate: 'PD certificate',
  communication_log: 'Communication log',
  other: 'Other',
} as const
