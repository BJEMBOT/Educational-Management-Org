import { notFound } from 'next/navigation'
import { getGrowthPlanById } from '@/lib/queries/growth-plans'
import { GrowthPlanDetail } from '@/components/growth-plans/growth-plan-detail'

export default async function GrowthPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = await getGrowthPlanById(id)
  if (!detail) notFound()

  return (
    <GrowthPlanDetail
      plan={detail.plan}
      goals={detail.goals}
      reflections={detail.reflections}
      evidence={detail.evidence}
    />
  )
}
