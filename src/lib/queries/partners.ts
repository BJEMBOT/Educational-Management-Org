import { createClient } from '@/lib/supabase/server'
import type { PartnerWithSchools } from '@/lib/database.types'

export async function getPartners(): Promise<PartnerWithSchools[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('partners')
    .select('*, partner_schools(schools(name))')
    .order('name')

  if (error) throw error

  return (data ?? []).map((row) => {
    const r = row as PartnerWithSchools & {
      partner_schools: { schools: { name: string } | { name: string }[] }[]
    }
    const schoolNames = (r.partner_schools ?? [])
      .map((ps) => {
        const school = Array.isArray(ps.schools) ? ps.schools[0] : ps.schools
        return school?.name
      })
      .filter(Boolean) as string[]

    const { partner_schools: _ps, ...partner } = r
    return {
      ...partner,
      school_names: schoolNames,
      school_count: schoolNames.length,
    }
  })
}

export async function getPartnerCountsBySchool(): Promise<Record<string, number>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('partner_schools')
    .select('school_id')

  if (error) throw error

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    counts[row.school_id] = (counts[row.school_id] ?? 0) + 1
  }
  return counts
}

export async function getPartnerSchoolIds(partnerId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('partner_schools')
    .select('school_id')
    .eq('partner_id', partnerId)
  return (data ?? []).map((r) => r.school_id)
}
