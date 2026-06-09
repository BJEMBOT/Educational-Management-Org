'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { GoalCategory, GoalStatus } from '@/lib/database.types'

export async function createGoal(formData: {
  school_id: string
  category: GoalCategory
  metric_name: string
  target_value: number
  current_value: number
  status: GoalStatus
  time_period: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('goals').insert([formData])

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/goals')
  revalidatePath(`/schools/${formData.school_id}`)
  return { success: true }
}

export async function updateGoal(
  id: string,
  schoolId: string,
  formData: Partial<{
    category: GoalCategory
    metric_name: string
    target_value: number
    current_value: number
    status: GoalStatus
    time_period: string
  }>
) {
  const supabase = await createClient()
  const { error } = await supabase.from('goals').update(formData).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/goals')
  revalidatePath(`/schools/${schoolId}`)
  return { success: true }
}

export async function deleteGoal(id: string, schoolId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('goals').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/goals')
  revalidatePath(`/schools/${schoolId}`)
  return { success: true }
}
