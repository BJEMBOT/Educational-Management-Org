import { createClient } from '@/lib/supabase/server'
import { canViewAllPartnerData, isPartnerUser } from '@/lib/permissions'
import type { PartnerUser, PartnerUserType, Profile } from '@/lib/database.types'

export async function getPartnerUsers(
  profile: Profile | null,
  type: PartnerUserType
): Promise<PartnerUser[]> {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*, partners(name)')
    .eq('role', 'partner')
    .eq('partner_user_type', type)
    .order('name')

  if (profile && isPartnerUser(profile)) {
    query = query.eq('partner_id', profile.partner_id!)
  } else if (profile && !canViewAllPartnerData(profile.role)) {
    return []
  }

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((row) => {
    const r = row as Profile & {
      partners: { name: string } | { name: string }[] | null
    }
    const partner = Array.isArray(r.partners) ? r.partners[0] : r.partners
    const { partners: _partners, ...user } = r
    return {
      ...user,
      partner_name: partner?.name ?? null,
    }
  })
}
