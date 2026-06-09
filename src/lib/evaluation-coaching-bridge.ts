import { frequencyFromEvaluation } from '@/lib/coaching-schedule'
import type { CheckInFrequency, TeachingEvaluation } from '@/lib/database.types'

export function shouldSuggestCoaching(rating: TeachingEvaluation | null): boolean {
  return rating === 'needs_improvement' || rating === 'developing'
}

export function coachingFocusFromEvaluation(
  rating: TeachingEvaluation | null
): string {
  switch (rating) {
    case 'needs_improvement':
      return 'Intensive instructional support and improvement plan'
    case 'developing':
      return 'Targeted instructional growth and practice refinement'
    case 'effective':
      return 'Sustaining effective practice and peer leadership'
    case 'exemplary':
      return 'Advanced practice and instructional leadership'
    default:
      return 'Instructional coaching and professional growth'
  }
}

export function defaultCoachingFrequency(
  rating: TeachingEvaluation | null
): CheckInFrequency {
  return frequencyFromEvaluation(rating)
}
