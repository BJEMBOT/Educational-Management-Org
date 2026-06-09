'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CoachingCycleStatus, ObservationType } from '@/lib/database.types'

export async function createCoachingCycle(data: {
  coach_id: string
  teacher_id: string
  school_id: string
  focus_area: string
  start_date?: string
  end_date?: string
}) {
  const supabase = await createClient()
  const { data: cycle, error } = await supabase
    .from('coaching_cycles')
    .insert([data])
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/coaching')
  revalidatePath('/workspace')
  return { success: true, id: cycle.id }
}

export async function updateCoachingCycle(
  id: string,
  data: Partial<{
    focus_area: string
    status: CoachingCycleStatus
    end_date: string
  }>
) {
  const supabase = await createClient()
  const { error } = await supabase.from('coaching_cycles').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/coaching')
  revalidatePath(`/coaching/${id}`)
  return { success: true }
}

export async function createObservation(data: {
  cycle_id: string
  observation_type: ObservationType
  notes: string
  feedback: string
  observation_date?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('observations').insert([data])
  if (error) return { error: error.message }
  revalidatePath(`/coaching/${data.cycle_id}`)
  revalidatePath('/coaching')
  return { success: true }
}

export async function addCoachingLog(data: {
  cycle_id: string
  content: string
  created_by: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('coaching_logs').insert([data])
  if (error) return { error: error.message }
  revalidatePath(`/coaching/${data.cycle_id}`)
  return { success: true }
}

export async function deleteCoachingCycle(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('coaching_cycles').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/coaching')
  return { success: true }
}
