'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ClipboardCheck } from 'lucide-react'
import { toast } from 'sonner'
import { addCoachingLog, createObservation } from '@/app/actions/coaching'
import { CoachingCheckInsPanel } from '@/components/coaching/coaching-check-ins-panel'
import { DeleteCoachingCycleButton } from '@/components/coaching/delete-coaching-cycle-button'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  CheckInFrequency,
  CoachingCheckIn,
  CoachingLog,
  FrequencySource,
  Observation,
  ObservationType,
} from '@/lib/database.types'

interface Props {
  cycle: {
    id: string
    focus_area: string
    status: string
    coach_name: string
    teacher_name: string
    school_name: string
    check_in_frequency: CheckInFrequency
    frequency_source: FrequencySource
    evaluation_cycle_id?: string | null
  }
  observations: Observation[]
  logs: CoachingLog[]
  checkIns: CoachingCheckIn[]
  coachId: string
  canWrite: boolean
  canDelete: boolean
}

export function CoachingCycleDetail({
  cycle,
  observations,
  logs,
  checkIns,
  coachId,
  canWrite,
  canDelete,
}: Props) {
  const router = useRouter()
  const [logContent, setLogContent] = useState('')
  const [obsType, setObsType] = useState<ObservationType>('walkthrough')
  const [notes, setNotes] = useState('')
  const [feedback, setFeedback] = useState('')

  async function handleAddLog() {
    if (!logContent.trim()) return
    const result = await addCoachingLog({
      cycle_id: cycle.id,
      content: logContent,
      created_by: coachId,
    })
    if (result.error) {
      toast.error(result.error)
      return
    }
    setLogContent('')
    toast.success('Log added')
    router.refresh()
  }

  async function handleAddObservation() {
    if (!notes.trim() || !feedback.trim()) return
    const result = await createObservation({
      cycle_id: cycle.id,
      evaluation_cycle_id: cycle.evaluation_cycle_id ?? undefined,
      observer_id: coachId,
      observation_type: obsType,
      notes,
      feedback,
    })
    if (result.error) {
      toast.error(result.error)
      return
    }
    setNotes('')
    setFeedback('')
    toast.success('Observation logged')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={cycle.teacher_name}
        subtitle={`${cycle.school_name} · ${cycle.focus_area} · Coach: ${cycle.coach_name}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">{cycle.status}</Badge>
            {canDelete && (
              <DeleteCoachingCycleButton
                cycleId={cycle.id}
                teacherName={cycle.teacher_name}
                schoolName={cycle.school_name}
              />
            )}
          </div>
        }
      />

      {cycle.evaluation_cycle_id && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Linked teacher evaluation</p>
            <p className="text-xs text-muted-foreground">
              Observations logged here also count toward the formal evaluation.
            </p>
          </div>
          <Link href={`/evaluations/${cycle.evaluation_cycle_id}`}>
            <Button size="sm" variant="outline">
              View evaluation
            </Button>
          </Link>
        </div>
      )}

      <CoachingCheckInsPanel
        checkIns={checkIns}
        frequency={cycle.check_in_frequency}
        frequencySource={cycle.frequency_source}
        canWrite={canWrite}
        canDelete={canDelete}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="font-heading font-semibold">Observations</h3>
          <ul className="mt-3 space-y-3">
            {observations.map((o) => (
              <li key={o.id} className="rounded-md border px-3 py-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize text-xs">
                    {o.observation_type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(o.observation_date), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  <span className="font-medium">Notes:</span> {o.notes}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Feedback:</span> {o.feedback}
                </p>
              </li>
            ))}
            {observations.length === 0 && (
              <p className="text-sm text-muted-foreground">No observations yet.</p>
            )}
          </ul>
          {canWrite && (
            <div className="mt-4 space-y-3 border-t pt-4">
              <Label>Log Observation</Label>
              <Select value={obsType} onValueChange={(v) => v && setObsType(v as ObservationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walkthrough">Walkthrough</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="informal">Informal</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Observation notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
              <Textarea
                placeholder="Feedback for teacher..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={2}
              />
              <Button size="sm" onClick={handleAddObservation}>
                Submit Observation
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="font-heading font-semibold">Coaching Log</h3>
          <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {logs.map((l) => (
              <li key={l.id} className="rounded-md bg-muted/40 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  {format(new Date(l.log_date), 'MMM d, yyyy')}
                </p>
                <p className="mt-1 text-sm">{l.content}</p>
              </li>
            ))}
          </ul>
          {canWrite && (
            <div className="mt-3 space-y-2 border-t pt-3">
              <Textarea
                placeholder="Add coaching log entry..."
                value={logContent}
                onChange={(e) => setLogContent(e.target.value)}
                rows={2}
              />
              <Button size="sm" onClick={handleAddLog}>
                Add Log Entry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
