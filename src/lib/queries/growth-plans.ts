import { createClient } from '@/lib/supabase/server'
import type {
  GrowthPlan,
  GrowthPlanEvidence,
  GrowthPlanGoal,
  GrowthPlanReflection,
  GrowthPlanWithDetails,
} from '@/lib/database.types'

export async function getGrowthPlans(userId?: string): Promise<GrowthPlanWithDetails[]> {
  const supabase = await createClient()
  let query = supabase
    .from('growth_plans')
    .select('*, schools(name), profiles(name)')
    .order('updated_at', { ascending: false })

  if (userId) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) throw error

  const plans = data ?? []
  const planIds = plans.map((p) => p.id)

  const goalCountByPlan = new Map<string, number>()
  if (planIds.length > 0) {
    const { data: goals, error: goalsError } = await supabase
      .from('growth_plan_goals')
      .select('plan_id')
      .in('plan_id', planIds)

    if (goalsError) throw goalsError
    for (const goal of goals ?? []) {
      goalCountByPlan.set(goal.plan_id, (goalCountByPlan.get(goal.plan_id) ?? 0) + 1)
    }
  }

  return plans.map((p) => {
    const row = p as GrowthPlan & {
      schools: { name: string }
      profiles: { name: string | null }
    }
    return {
      ...row,
      school_name: row.schools.name,
      user_name: row.profiles.name ?? 'Unknown',
      goal_count: goalCountByPlan.get(row.id) ?? 0,
    }
  })
}

export async function getGrowthPlanById(id: string) {
  const supabase = await createClient()
  const [planRes, goalsRes, reflectionsRes, evidenceRes] = await Promise.all([
    supabase
      .from('growth_plans')
      .select('*, schools(name), profiles(name)')
      .eq('id', id)
      .single(),
    supabase
      .from('growth_plan_goals')
      .select('*')
      .eq('plan_id', id)
      .order('sort_order'),
    supabase
      .from('growth_plan_reflections')
      .select('*')
      .eq('plan_id', id)
      .order('reflection_date', { ascending: false }),
    supabase
      .from('growth_plan_evidence')
      .select('*')
      .eq('plan_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (planRes.error || !planRes.data) return null

  const p = planRes.data as GrowthPlan & {
    schools: { name: string }
    profiles: { name: string | null }
  }

  return {
    plan: {
      ...p,
      school_name: p.schools.name,
      user_name: p.profiles.name ?? 'Unknown',
    },
    goals: (goalsRes.data ?? []) as GrowthPlanGoal[],
    reflections: (reflectionsRes.data ?? []) as GrowthPlanReflection[],
    evidence: (evidenceRes.data ?? []) as GrowthPlanEvidence[],
  }
}

export function summarizeGrowthPlans(
  plans: Awaited<ReturnType<typeof getGrowthPlans>>
) {
  return {
    total: plans.length,
    active: plans.filter((p) => p.status === 'active').length,
    completed: plans.filter((p) => p.status === 'completed').length,
  }
}

export async function getGrowthPlanSummary(userId: string) {
  const plans = await getGrowthPlans(userId)
  return summarizeGrowthPlans(plans)
}
