'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createEvaluationObservation } from '@/app/actions/evaluations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function WalkthroughForm({
  evaluationCycleId,
  observerId,
  linkedCoachingCycleId,
}: {
  evaluationCycleId: string
  observerId: string
  linkedCoachingCycleId?: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [feedback, setFeedback] = useState('')
  const [engagement, setEngagement] = useState('')
  const [management, setManagement] = useState('')
  const [differentiation, setDifferentiation] = useState('')
  const [technology, setTechnology] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!notes.trim() || !feedback.trim()) {
      toast.error('Notes and feedback are required.')
      return
    }

    setLoading(true)
    const result = await createEvaluationObservation({
      evaluation_cycle_id: evaluationCycleId,
      observer_id: observerId,
      observation_type: 'walkthrough',
      notes,
      feedback,
      cycle_id: linkedCoachingCycleId ?? undefined,
      walkthrough_data: {
        student_engagement: engagement,
        classroom_management: management,
        differentiation,
        technology_integration: technology,
      },
    })
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Walkthrough recorded')
    setNotes('')
    setFeedback('')
    setEngagement('')
    setManagement('')
    setDifferentiation('')
    setTechnology('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Student engagement</Label>
          <Input
            value={engagement}
            onChange={(e) => setEngagement(e.target.value)}
            placeholder="e.g. High, mixed, low"
          />
        </div>
        <div className="space-y-2">
          <Label>Classroom management</Label>
          <Input
            value={management}
            onChange={(e) => setManagement(e.target.value)}
            placeholder="e.g. Smooth transitions"
          />
        </div>
        <div className="space-y-2">
          <Label>Differentiation</Label>
          <Input
            value={differentiation}
            onChange={(e) => setDifferentiation(e.target.value)}
            placeholder="e.g. Tiered tasks observed"
          />
        </div>
        <div className="space-y-2">
          <Label>Technology integration</Label>
          <Input
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
            placeholder="e.g. Interactive whiteboard"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Quick notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What you observed…"
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label>Feedback</Label>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Brief feedback…"
          rows={2}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving…' : 'Log walkthrough'}
      </Button>
    </form>
  )
}
