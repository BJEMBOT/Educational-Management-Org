'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import { CoachingCycleForm } from '@/components/coaching/coaching-cycle-form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  coachingFocusFromEvaluation,
  defaultCoachingFrequency,
  shouldSuggestCoaching,
} from '@/lib/evaluation-coaching-bridge'
import { frequencyLabels } from '@/lib/coaching-schedule'
import type { Profile, School, TeachingEvaluation } from '@/lib/database.types'

export function CoachingLinkPanel({
  evaluationCycleId,
  teacherId,
  schoolId,
  overallRating,
  teacherEvaluation,
  linkedCoachingCycle,
  schools,
  teachers,
  coaches,
  defaultCoachId,
  showCoachPicker,
  canCreateCoaching,
}: {
  evaluationCycleId: string
  teacherId: string
  schoolId: string
  overallRating: TeachingEvaluation | null
  teacherEvaluation: TeachingEvaluation | null
  linkedCoachingCycle: {
    id: string
    focus_area: string
    status: string
    coach_name: string
  } | null
  schools: School[]
  teachers: Profile[]
  coaches: Profile[]
  defaultCoachId: string
  showCoachPicker: boolean
  canCreateCoaching: boolean
}) {
  const rating = overallRating ?? teacherEvaluation
  const suggestCoaching = shouldSuggestCoaching(rating)
  const focusArea = coachingFocusFromEvaluation(rating)
  const frequency = defaultCoachingFrequency(rating)

  if (linkedCoachingCycle) {
    return (
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Linked coaching cycle</p>
            <p className="text-sm text-muted-foreground">
              Coach: {linkedCoachingCycle.coach_name} · {linkedCoachingCycle.focus_area}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {linkedCoachingCycle.status}
            </Badge>
            <Link href={`/coaching/${linkedCoachingCycle.id}`}>
              <Button size="sm" variant="outline">
                View cycle
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div className="flex-1 space-y-2">
          <p className="font-medium">Instructional coaching</p>
          {suggestCoaching ? (
            <p className="text-sm text-muted-foreground">
              Based on the current evaluation rating, consider starting a coaching cycle
              with {frequencyLabels[frequency]} check-ins focused on: {focusArea}.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No coaching cycle is linked to this evaluation. Start one to provide
              ongoing instructional support.
            </p>
          )}
          {canCreateCoaching && (
            <CoachingCycleForm
              schools={schools}
              teachers={teachers}
              coaches={coaches}
              defaultCoachId={defaultCoachId}
              showCoachPicker={showCoachPicker}
              evaluationCycleId={evaluationCycleId}
              defaultTeacherId={teacherId}
              defaultSchoolId={schoolId}
              defaultFocusArea={focusArea}
              defaultFrequency={frequency}
              trigger="Start coaching cycle"
              triggerSize="sm"
            />
          )}
        </div>
      </div>
    </div>
  )
}
