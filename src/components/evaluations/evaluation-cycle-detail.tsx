'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { completeEvaluationCycle } from '@/app/actions/evaluations'
import { DeleteEvaluationCycleButton } from '@/components/evaluations/delete-evaluation-cycle-button'
import { CoachingLinkPanel } from '@/components/evaluations/coaching-link-panel'
import { EvaluationArtifactsPanel } from '@/components/evaluations/evaluation-artifacts-panel'
import {
  EvaluationRatingBadge,
  EvaluationStatusBadge,
} from '@/components/evaluations/evaluation-status-badge'
import { ObservationList } from '@/components/evaluations/observation-list'
import { RubricScoringForm } from '@/components/evaluations/rubric-scoring-form'
import { WalkthroughForm } from '@/components/evaluations/walkthrough-form'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { evaluationLabels } from '@/lib/coaching-schedule'
import { cycleTypeLabels } from '@/lib/evaluation-rubric'
import type { EvaluationCycleStatus } from '@/lib/database.types'
import type { AggregatedRubricScores, RubricDomain } from '@/lib/evaluation-rubric'
import type {
  EvaluationArtifactWithUploader,
  ObservationWithDetails,
  Profile,
  School,
  TeachingEvaluation,
} from '@/lib/database.types'

type Tab = 'overview' | 'observations' | 'rubric' | 'artifacts' | 'coaching'

interface Props {
  cycle: {
    id: string
    teacher_id: string
    school_id: string
    teacher_name: string
    evaluator_name: string
    school_name: string
    framework_name: string
    cycle_type: string
    school_year: string
    status: string
    start_date: string
    end_date: string | null
    overall_rating: TeachingEvaluation | null
    evaluator_id: string
  }
  observations: ObservationWithDetails[]
  artifacts: EvaluationArtifactWithUploader[]
  rubricTree: RubricDomain[]
  aggregatedScores: AggregatedRubricScores
  linkedCoachingCycle: {
    id: string
    focus_area: string
    status: string
    coach_name: string
  } | null
  teacherEvaluation: TeachingEvaluation | null
  schools: School[]
  teachers: Profile[]
  coaches: Profile[]
  defaultCoachId: string
  showCoachPicker: boolean
  observerId: string
  currentUserId: string
  canConduct: boolean
  canManage: boolean
  canUploadArtifacts: boolean
  canCreateCoaching: boolean
  canDelete: boolean
}

export function EvaluationCycleDetail(props: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [completing, setCompleting] = useState(false)

  async function handleComplete() {
    setCompleting(true)
    const result = await completeEvaluationCycle(props.cycle.id)
    setCompleting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Evaluation completed')
    router.refresh()
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'observations', label: 'Observations' },
    { id: 'rubric', label: 'Rubric scores' },
    { id: 'artifacts', label: 'Artifacts' },
    { id: 'coaching', label: 'Coaching' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${props.cycle.teacher_name} — ${props.cycle.school_year}`}
        subtitle={`${props.cycle.framework_name} · ${props.cycle.school_name} · Evaluator: ${props.cycle.evaluator_name}`}
        actions={
          <div className="flex items-center gap-2">
            {props.canManage && props.cycle.status !== 'completed' && (
              <Button size="sm" onClick={handleComplete} disabled={completing}>
                {completing ? 'Completing…' : 'Complete evaluation'}
              </Button>
            )}
            {props.canDelete && (
              <DeleteEvaluationCycleButton
                cycleId={props.cycle.id}
                teacherName={props.cycle.teacher_name}
                schoolYear={props.cycle.school_year}
              />
            )}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <EvaluationStatusBadge status={props.cycle.status as EvaluationCycleStatus} />
        <EvaluationRatingBadge rating={props.cycle.overall_rating} />
        <span className="text-sm text-muted-foreground capitalize">
          {cycleTypeLabels[props.cycle.cycle_type as keyof typeof cycleTypeLabels]} cycle
        </span>
        <span className="text-sm text-muted-foreground">
          {format(new Date(props.cycle.start_date), 'MMM d, yyyy')}
          {props.cycle.end_date &&
            ` – ${format(new Date(props.cycle.end_date), 'MMM d, yyyy')}`}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border p-5">
            <h3 className="font-heading text-base font-semibold">Summary</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Observations</dt>
                <dd>{props.observations.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Artifacts</dt>
                <dd>{props.artifacts.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Current profile rating</dt>
                <dd>
                  {props.teacherEvaluation
                    ? evaluationLabels[props.teacherEvaluation]
                    : 'Not set'}
                </dd>
              </div>
              {props.aggregatedScores.overall_average > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Computed rubric average</dt>
                  <dd>
                    {props.aggregatedScores.overall_average.toFixed(2)} (
                    {evaluationLabels[props.aggregatedScores.overall_rating]})
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <CoachingLinkPanel
            evaluationCycleId={props.cycle.id}
            teacherId={props.cycle.teacher_id}
            schoolId={props.cycle.school_id}
            overallRating={props.cycle.overall_rating}
            teacherEvaluation={props.teacherEvaluation}
            linkedCoachingCycle={props.linkedCoachingCycle}
            schools={props.schools}
            teachers={props.teachers}
            coaches={props.coaches}
            defaultCoachId={props.defaultCoachId}
            showCoachPicker={props.showCoachPicker}
            canCreateCoaching={props.canCreateCoaching}
          />
        </div>
      )}

      {tab === 'observations' && (
        <div className="space-y-8">
          {props.canConduct && props.cycle.status !== 'completed' && (
            <>
              <div>
                <h3 className="mb-3 font-medium">Log walkthrough</h3>
                <WalkthroughForm
                  evaluationCycleId={props.cycle.id}
                  observerId={props.observerId}
                  linkedCoachingCycleId={props.linkedCoachingCycle?.id}
                />
              </div>
              <div>
                <h3 className="mb-3 font-medium">Formal observation</h3>
                <RubricScoringForm
                  evaluationCycleId={props.cycle.id}
                  observerId={props.observerId}
                  rubricTree={props.rubricTree}
                  linkedCoachingCycleId={props.linkedCoachingCycle?.id}
                />
              </div>
            </>
          )}
          <div>
            <h3 className="mb-3 font-medium">Observation history</h3>
            <ObservationList observations={props.observations} />
          </div>
        </div>
      )}

      {tab === 'rubric' && (
        <div className="space-y-4">
          {props.aggregatedScores.domains.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No rubric scores yet. Complete a formal observation to generate domain scores.
            </p>
          ) : (
            <>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Overall performance</p>
                <p className="text-2xl font-semibold">
                  {evaluationLabels[props.aggregatedScores.overall_rating]}
                </p>
                <p className="text-sm text-muted-foreground">
                  Average score: {props.aggregatedScores.overall_average.toFixed(2)} / 4
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {props.aggregatedScores.domains.map((d) => (
                  <div key={d.domain_id} className="rounded-lg border p-4">
                    <p className="font-medium">{d.domain_name}</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {evaluationLabels[d.rating]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {d.average.toFixed(2)} avg · {d.indicator_count} indicators
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="rounded-lg border p-4">
            <h4 className="font-medium">Framework indicators</h4>
            <div className="mt-3 space-y-4">
              {props.rubricTree.map((domain) => (
                <div key={domain.id}>
                  <p className="text-sm font-medium">{domain.name}</p>
                  <ul className="mt-1 space-y-1">
                    {domain.indicators.map((ind) => (
                      <li key={ind.id} className="text-sm text-muted-foreground">
                        <span className="font-mono text-xs">{ind.code}</span> —{' '}
                        {ind.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'artifacts' && (
        <EvaluationArtifactsPanel
          evaluationCycleId={props.cycle.id}
          artifacts={props.artifacts}
          uploadedBy={props.currentUserId}
          canUpload={props.canUploadArtifacts}
        />
      )}

      {tab === 'coaching' && (
        <CoachingLinkPanel
          evaluationCycleId={props.cycle.id}
          teacherId={props.cycle.teacher_id}
          schoolId={props.cycle.school_id}
          overallRating={props.cycle.overall_rating}
          teacherEvaluation={props.teacherEvaluation}
          linkedCoachingCycle={props.linkedCoachingCycle}
          schools={props.schools}
          teachers={props.teachers}
          coaches={props.coaches}
          defaultCoachId={props.defaultCoachId}
          showCoachPicker={props.showCoachPicker}
          canCreateCoaching={props.canCreateCoaching}
        />
      )}
    </div>
  )
}
