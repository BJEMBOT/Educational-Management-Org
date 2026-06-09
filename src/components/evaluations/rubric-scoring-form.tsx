'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createEvaluationObservation } from '@/app/actions/evaluations'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ratingLabels } from '@/lib/evaluation-rubric'
import type { RubricDomain } from '@/lib/evaluation-rubric'
import type { RubricRating } from '@/lib/database.types'

export function RubricScoringForm({
  evaluationCycleId,
  observerId,
  rubricTree,
  linkedCoachingCycleId,
}: {
  evaluationCycleId: string
  observerId: string
  rubricTree: RubricDomain[]
  linkedCoachingCycleId?: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [feedback, setFeedback] = useState('')
  const [scores, setScores] = useState<Record<string, RubricRating>>({})

  function setScore(indicatorId: string, rating: RubricRating) {
    setScores((prev) => ({ ...prev, [indicatorId]: rating }))
  }

  const allIndicators = rubricTree.flatMap((d) => d.indicators)
  const allScored = allIndicators.every((ind) => scores[ind.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!notes.trim() || !feedback.trim()) {
      toast.error('Notes and feedback are required.')
      return
    }
    if (!allScored) {
      toast.error('Please score all indicators before submitting.')
      return
    }

    setLoading(true)
    const rubric_scores = allIndicators.map((ind) => ({
      indicator_id: ind.id,
      code: ind.code,
      rating: scores[ind.id],
    }))

    const result = await createEvaluationObservation({
      evaluation_cycle_id: evaluationCycleId,
      observer_id: observerId,
      observation_type: 'formal',
      notes,
      feedback,
      cycle_id: linkedCoachingCycleId ?? undefined,
      rubric_scores,
    })
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Formal observation recorded')
    setNotes('')
    setFeedback('')
    setScores({})
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {rubricTree.map((domain) => (
          <div key={domain.id} className="rounded-lg border p-4">
            <h4 className="font-medium">{domain.name}</h4>
            <div className="mt-3 space-y-3">
              {domain.indicators.map((ind) => (
                <div
                  key={ind.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <span className="text-sm font-medium">{ind.code}</span>
                    <p className="text-sm text-muted-foreground">{ind.description}</p>
                  </div>
                  <Select
                    value={scores[ind.id] ?? ''}
                    onValueChange={(v) => setScore(ind.id, v as RubricRating)}
                  >
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue placeholder="Rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ratingLabels) as RubricRating[]).map((r) => (
                        <SelectItem key={r} value={r}>
                          {ratingLabels[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Observation notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Evidence observed during the visit…"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label>Feedback for teacher</Label>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Constructive feedback and next steps…"
          rows={3}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Submit formal observation'}
      </Button>
    </form>
  )
}
