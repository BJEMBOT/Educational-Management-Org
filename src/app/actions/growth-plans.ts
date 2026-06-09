'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { GoalItemStatus, GrowthPlanStatus } from '@/lib/database.types'

export async function createGrowthPlan(data: {
  user_id: string
  school_id: string
  school_year: string
  status?: GrowthPlanStatus
}) {
  const supabase = await createClient()
  const { data: plan, error } = await supabase
    .from('growth_plans')
    .insert([{ ...data, status: data.status ?? 'draft' }])
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/growth-plans')
  revalidatePath('/workspace')
  return { success: true, id: plan.id }
}

export async function updateGrowthPlan(
  id: string,
  data: Partial<{ school_year: string; status: GrowthPlanStatus; school_id: string }>
) {
  const supabase = await createClient()
  const { error } = await supabase.from('growth_plans').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/growth-plans')
  revalidatePath(`/growth-plans/${id}`)
  return { success: true }
}

export async function deleteGrowthPlan(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('growth_plans').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/growth-plans')
  return { success: true }
}

export async function addGrowthPlanGoal(data: {
  plan_id: string
  goal_text: string
  action_steps?: string
  status?: GoalItemStatus
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('growth_plan_goals').insert([data])
  if (error) return { error: error.message }
  revalidatePath(`/growth-plans/${data.plan_id}`)
  return { success: true }
}

export async function updateGrowthPlanGoal(
  id: string,
  planId: string,
  data: Partial<{ goal_text: string; action_steps: string; status: GoalItemStatus }>
) {
  const supabase = await createClient()
  const { error } = await supabase.from('growth_plan_goals').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/growth-plans/${planId}`)
  return { success: true }
}

export async function addReflection(planId: string, content: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('growth_plan_reflections')
    .insert([{ plan_id: planId, content }])
  if (error) return { error: error.message }
  revalidatePath(`/growth-plans/${planId}`)
  return { success: true }
}

export async function addEvidence(data: {
  plan_id: string
  title: string
  url?: string
  notes?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('growth_plan_evidence').insert([data])
  if (error) return { error: error.message }
  revalidatePath(`/growth-plans/${data.plan_id}`)
  return { success: true }
}
