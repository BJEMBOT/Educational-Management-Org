import { Badge } from '@/components/ui/badge'
import { evaluationLabels } from '@/lib/coaching-schedule'
import { cycleStatusLabels } from '@/lib/evaluation-rubric'
import type { EvaluationCycleStatus, TeachingEvaluation } from '@/lib/database.types'

export function EvaluationStatusBadge({ status }: { status: EvaluationCycleStatus }) {
  return (
    <Badge variant="outline" className="capitalize">
      {cycleStatusLabels[status]}
    </Badge>
  )
}

export function EvaluationRatingBadge({
  rating,
}: {
  rating: TeachingEvaluation | null
}) {
  if (!rating) {
    return <Badge variant="secondary">Not rated</Badge>
  }
  const variant =
    rating === 'exemplary' || rating === 'effective'
      ? 'default'
      : rating === 'developing'
        ? 'outline'
        : 'destructive'
  return (
    <Badge variant={variant}>{evaluationLabels[rating]}</Badge>
  )
}
