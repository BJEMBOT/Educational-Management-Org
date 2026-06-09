import { createClient } from '@/lib/supabase/server'
import type { InterventionWithSchool } from '@/lib/database.types'

export async function getRecentOpenInterventions(limit = 5) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('interventions')
    .select('id, issue, date, school_id, schools(name)')
    .eq('status', 'open')
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row) => {
    const r = row as {
      id: string
      issue: string
      date: string
      school_id: string
      schools: { name: string } | { name: string }[]
    }
    const school = Array.isArray(r.schools) ? r.schools[0] : r.schools
    return {
      id: r.id,
      issue: r.issue,
      date: r.date,
      school_id: r.school_id,
      school_name: school?.name ?? 'Unknown',
    }
  })
}

export async function getInterventions(): Promise<InterventionWithSchool[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('interventions')
    .select('*, schools(name)')
    .order('date', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const { schools, ...intervention } = row as InterventionWithSchool & {
      schools: { name: string }
    }
    return {
      ...intervention,
      school_name: schools.name,
    }
  })
}
