import { createClient } from '@/lib/supabase/server'
import { canManagePartners, isPartnerUser } from '@/lib/permissions'
import type { PartnerWithSchools, Profile } from '@/lib/database.types'

function mapPartnerRow(
  row: PartnerWithSchools & {
    partner_schools: { schools: { name: string } | { name: string }[] }[]
  }
): PartnerWithSchools {
  const schoolNames = (row.partner_schools ?? [])
    .map((ps) => {
      const school = Array.isArray(ps.schools) ? ps.schools[0] : ps.schools
      return school?.name
    })
    .filter(Boolean) as string[]

  const { partner_schools: _ps, ...partner } = row
  return {
    ...partner,
    school_names: schoolNames,
    school_count: schoolNames.length,
  }
}

export async function getPartners(): Promise<PartnerWithSchools[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('partners')
    .select('*, partner_schools(schools(name))')
    .order('name')

  if (error) throw error

  return (data ?? []).map((row) =>
    mapPartnerRow(
      row as PartnerWithSchools & {
        partner_schools: { schools: { name: string } | { name: string }[] }[]
      }
    )
  )
}

export async function getPartnersForViewer(
  profile: Profile | null
): Promise<PartnerWithSchools[]> {
  if (!profile) return getPartners()

  if (isPartnerUser(profile)) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('partners')
      .select('*, partner_schools(schools(name))')
      .eq('id', profile.partner_id!)
      .order('name')

    if (error) throw error
    if (!data?.length) return []

    return data.map((row) =>
      mapPartnerRow(
        row as PartnerWithSchools & {
          partner_schools: { schools: { name: string } | { name: string }[] }[]
        }
      )
    )
  }

  return getPartners()
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

export function canViewerManagePartners(profile: Profile | null): boolean {
  if (!profile) return false
  return canManagePartners(profile.role)
}
