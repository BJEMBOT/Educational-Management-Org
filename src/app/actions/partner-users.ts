'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import { hasPermission } from '@/lib/permissions'
import type { PartnerUserType } from '@/lib/database.types'

async function requirePartnerUserManage() {
  const profile = await getCurrentProfile()
  if (!profile) return { error: 'Not authenticated' as const, profile: null }
  const canManage =
    hasPermission(profile.role, '*') ||
    profile.role === 'admin' ||
    profile.role === 'developer'
  if (!canManage) {
    return { error: 'Only administrators can manage partner users.' as const, profile: null }
  }
  return { error: null, profile }
}

export async function linkProfileToPartner(
  userId: string,
  partnerId: string,
  partnerUserType: PartnerUserType
) {
  const { error: permError } = await requirePartnerUserManage()
  if (permError) return { error: permError }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      role: 'partner',
      partner_id: partnerId,
      partner_user_type: partnerUserType,
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/partners')
  revalidatePath('/partners/employees')
  revalidatePath('/partners/administrators')
  return { success: true }
}
