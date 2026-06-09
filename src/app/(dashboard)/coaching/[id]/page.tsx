import { notFound } from 'next/navigation'
import { getCoachingCycleById } from '@/lib/queries/coaching'
import { getCurrentProfile } from '@/lib/queries/profile'
import { CoachingCycleDetail } from '@/components/coaching/coaching-cycle-detail'

export default async function CoachingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [detail, profile] = await Promise.all([
    getCoachingCycleById(id),
    getCurrentProfile(),
  ])

  if (!detail) notFound()

  const canWrite =
    profile?.role === 'coach' ||
    profile?.role === 'consultant' ||
    profile?.role === 'admin'

  return (
    <CoachingCycleDetail
      cycle={detail.cycle}
      observations={detail.observations}
      logs={detail.logs}
      coachId={profile?.id ?? detail.cycle.coach_id}
      canWrite={canWrite}
    />
  )
}
