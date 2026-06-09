import { Plus } from 'lucide-react'
import { getCurrentProfile } from '@/lib/queries/profile'
import { getProfilesByRole } from '@/lib/queries/coaching'
import {
  getEvaluationCycles,
  getEvaluationFrameworks,
  getEvaluatorProfiles,
} from '@/lib/queries/evaluations'
import { getSchools } from '@/lib/queries/schools'
import {
  canDeleteScheduledRecords,
  canManageEvaluations,
  canViewAllEvaluations,
} from '@/lib/permissions'
import { EvaluationCycleForm } from '@/components/evaluations/evaluation-cycle-form'
import { EvaluationsTable } from '@/components/evaluations/evaluations-table'
import { PageHeader } from '@/components/ui/page-header'
import { DataTableWrapper } from '@/components/ui/data-table-wrapper'

export default async function EvaluationsPage() {
  const profile = await getCurrentProfile()
  const canCreate = profile ? canManageEvaluations(profile.role) : false
  const canDelete = profile ? canDeleteScheduledRecords(profile.role) : false
  const viewAll = profile ? canViewAllEvaluations(profile.role) : false

  const [cycles, schools, teachers, evaluators, frameworks] = await Promise.all([
    getEvaluationCycles(viewAll ? undefined : undefined),
    getSchools(),
    getProfilesByRole('teacher'),
    getEvaluatorProfiles(),
    getEvaluationFrameworks(),
  ])

  const defaultEvaluatorId = profile?.id ?? evaluators[0]?.id ?? ''

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Evaluations"
        subtitle="Formal evaluations, observations, rubric scoring, and coaching alignment"
        actions={
          canCreate && profile ? (
            <EvaluationCycleForm
              schools={schools}
              teachers={teachers}
              evaluators={evaluators}
              frameworks={frameworks}
              defaultEvaluatorId={defaultEvaluatorId}
              trigger={
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  New Evaluation
                </>
              }
            />
          ) : undefined
        }
      />

      <DataTableWrapper>
        <EvaluationsTable cycles={cycles} canDelete={canDelete} />
      </DataTableWrapper>
    </div>
  )
}
