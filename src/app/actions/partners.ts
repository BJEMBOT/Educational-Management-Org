'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import { canManagePartners } from '@/lib/permissions'
import type { PartnerStatus, PartnerType } from '@/lib/database.types'

async function requirePartnerManage() {
  const profile = await getCurrentProfile()
  if (!profile) return { error: 'Not authenticated' as const, profile: null }
  const canManage = canManagePartners(profile.role)
  if (!canManage) return { error: 'Only administrators can manage partners.' as const, profile: null }
  return { error: null, profile }
}

async function syncPartnerSchools(partnerId: string, schoolIds: string[]) {
  const supabase = await createClient()
  await supabase.from('partner_schools').delete().eq('partner_id', partnerId)
  if (schoolIds.length > 0) {
    const { error } = await supabase.from('partner_schools').insert(
      schoolIds.map((schoolId) => ({ partner_id: partnerId, school_id: schoolId }))
    )
    if (error) throw error
  }
}

export async function createPartner(data: {
  name: string
  partner_type: PartnerType
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  services?: string
  website?: string
  status?: PartnerStatus
  notes?: string
  school_ids?: string[]
}) {
  const { error: permError } = await requirePartnerManage()
  if (permError) return { error: permError }

  const { school_ids, ...partnerData } = data
  const supabase = await createClient()
  const { data: partner, error } = await supabase
    .from('partners')
    .insert([partnerData])
    .select('id')
    .single()

  if (error) return { error: error.message }

  try {
    await syncPartnerSchools(partner.id, school_ids ?? [])
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to link schools' }
  }

  revalidatePath('/partners')
  revalidatePath('/partners/employees')
  revalidatePath('/partners/administrators')
  return { success: true, id: partner.id }
}

export async function updatePartner(
  id: string,
  data: Partial<{
    name: string
    partner_type: PartnerType
    contact_name: string
    contact_email: string
    contact_phone: string
    services: string
    website: string
    status: PartnerStatus
    notes: string
    school_ids: string[]
  }>
) {
  const { error: permError } = await requirePartnerManage()
  if (permError) return { error: permError }

  const { school_ids, ...partnerData } = data
  const supabase = await createClient()

  if (Object.keys(partnerData).length > 0) {
    const { error } = await supabase.from('partners').update(partnerData).eq('id', id)
    if (error) return { error: error.message }
  }

  if (school_ids !== undefined) {
    try {
      await syncPartnerSchools(id, school_ids)
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to update schools' }
    }
  }

  revalidatePath('/partners')
  revalidatePath('/partners/employees')
  revalidatePath('/partners/administrators')
  return { success: true }
}

export async function setPartnerStatus(id: string, status: PartnerStatus) {
  const { error: permError } = await requirePartnerManage()
  if (permError) return { error: permError }

  const supabase = await createClient()
  const { error } = await supabase.from('partners').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/partners')
  revalidatePath('/partners/employees')
  revalidatePath('/partners/administrators')
  return { success: true }
}

export async function deletePartner(id: string) {
  const { error: permError } = await requirePartnerManage()
  if (permError) return { error: permError }

  const supabase = await createClient()
  const { error } = await supabase.from('partners').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/partners')
  revalidatePath('/partners/employees')
  revalidatePath('/partners/administrators')
  return { success: true }
}
