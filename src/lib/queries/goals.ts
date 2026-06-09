import { createClient } from '@/lib/supabase/server'
import type { Goal, GoalWithSchool } from '@/lib/database.types'

export async function getGoals(): Promise<GoalWithSchool[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*, schools(name)')
    .order('school_id')

  if (error) throw error

  return (data ?? []).map((row) => {
    const { schools, ...goal } = row as Goal & { schools: { name: string } }
    return {
      ...goal,
      school_name: schools.name,
    }
  })
}

export async function getGoalsBySchool(schoolId: string): Promise<Goal[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('school_id', schoolId)
    .order('category')

  if (error) throw error
  return data ?? []
}
