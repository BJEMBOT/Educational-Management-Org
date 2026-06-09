import { notFound } from 'next/navigation'
import { getCurrentProfile } from '@/lib/queries/profile'
import { getProfilesByRole, getCoachProfiles } from '@/lib/queries/coaching'
import { getEvaluationCycleById } from '@/lib/queries/evaluations'
import { getSchools } from '@/lib/queries/schools'
import {
  canConductEvaluations,
  canDeleteScheduledRecords,
  canManageCoaching,
  canManageEvaluations,
} from '@/lib/permissions'
import { EvaluationCycleDetail } from '@/components/evaluations/evaluation-cycle-detail'

export default async function EvaluationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getCurrentProfile()
  if (!profile) notFound()

  const data = await getEvaluationCycleById(id)
  if (!data) notFound()

  const isTeacher = profile.role === 'teacher'
  if (isTeacher && data.cycle.teacher_id !== profile.id) notFound()

  const canManage = canManageEvaluations(profile.role)
  const canConduct =
    canManage ||
    (canConductEvaluations(profile.role) &&
      data.cycle.evaluator_id === profile.id)
  const canUploadArtifacts =
    data.cycle.teacher_id === profile.id ||
    canManage ||
    canConduct
  const canCreateCoaching = canManageCoaching(profile.role)
  const canDelete = canDeleteScheduledRecords(profile.role)

  const [schools, teachers, coaches] = await Promise.all([
    getSchools(),
    getProfilesByRole('teacher'),
    getCoachProfiles(),
  ])

  const showCoachPicker =
    profile.role === 'admin' ||
    profile.role === 'developer' ||
    profile.role === 'regional_manager'

  const defaultCoachId =
    profile.role === 'coach' || profile.role === 'consultant'
      ? profile.id
      : coaches[0]?.id ?? profile.id

  return (
    <EvaluationCycleDetail
      cycle={data.cycle}
      observations={data.observations}
      artifacts={data.artifacts}
      rubricTree={data.rubricTree}
      aggregatedScores={data.aggregatedScores}
      linkedCoachingCycle={data.linkedCoachingCycle}
      teacherEvaluation={data.teacherEvaluation}
      schools={schools}
      teachers={teachers}
      coaches={coaches}
      defaultCoachId={defaultCoachId}
      showCoachPicker={showCoachPicker}
      observerId={profile.id}
      currentUserId={profile.id}
      canConduct={canConduct}
      canManage={canManage}
      canUploadArtifacts={canUploadArtifacts}
      canCreateCoaching={canCreateCoaching}
      canDelete={canDelete}
    />
  )
}
