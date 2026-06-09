'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import { canManagePd } from '@/lib/permissions'
import { getGroupMemberIds } from '@/lib/queries/users'

async function requireAssignPermission() {
  const profile = await getCurrentProfile()
  if (!profile || !canManagePd(profile.role)) {
    return { error: 'Only administrators can assign PD sessions.' as const, profile: null }
  }
  return { error: null, profile }
}

export async function assignPdToUsers(
  eventId: string,
  userIds: string[]
) {
  const { error: permError, profile } = await requireAssignPermission()
  if (permError || !profile) return { error: permError ?? 'Unauthorized' }

  const uniqueIds = [...new Set(userIds)]
  if (uniqueIds.length === 0) return { error: 'Select at least one user.' }

  const supabase = await createClient()
  const rows = uniqueIds.map((userId) => ({
    event_id: eventId,
    user_id: userId,
    status: 'registered' as const,
    assigned_by: profile.id,
  }))

  const { error } = await supabase
    .from('pd_registrations')
    .upsert(rows, { onConflict: 'event_id,user_id', ignoreDuplicates: false })

  if (error) return { error: error.message }

  revalidatePath('/pd')
  revalidatePath(`/pd/${eventId}`)
  revalidatePath('/workspace')
  return { success: true, count: uniqueIds.length }
}

export async function assignPdToGroup(eventId: string, groupId: string) {
  const memberIds = await getGroupMemberIds(groupId)
  if (memberIds.length === 0) return { error: 'This group has no members.' }
  return assignPdToUsers(eventId, memberIds)
}

export async function createUserGroup(data: {
  name: string
  description?: string
  memberIds: string[]
}) {
  const { error: permError, profile } = await requireAssignPermission()
  if (permError || !profile) return { error: permError ?? 'Unauthorized' }

  const supabase = await createClient()
  const { data: group, error } = await supabase
    .from('user_groups')
    .insert([{ name: data.name, description: data.description, created_by: profile.id }])
    .select()
    .single()

  if (error) return { error: error.message }

  if (data.memberIds.length > 0) {
    const { error: memberError } = await supabase.from('user_group_members').insert(
      data.memberIds.map((userId) => ({ group_id: group.id, user_id: userId }))
    )
    if (memberError) return { error: memberError.message }
  }

  revalidatePath('/pd')
  return { success: true, groupId: group.id }
}

export async function searchUsersForAssignment(query: string) {
  const { error: permError } = await requireAssignPermission()
  if (permError) return { error: permError, users: [] }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name')

  if (error) return { error: error.message, users: [] }

  const profiles = data ?? []
  if (!query.trim()) return { users: profiles }

  const q = query.toLowerCase()
  return {
    users: profiles.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q)
    ),
  }
}

export async function getGroupsForAssignment() {
  const { error: permError } = await requireAssignPermission()
  if (permError) return { error: permError, groups: [] }

  const supabase = await createClient()
  const { data, error } = await supabase.from('user_groups').select('*').order('name')
  if (error) return { error: error.message, groups: [] }

  const groups = await Promise.all(
    (data ?? []).map(async (g) => {
      const { count } = await supabase
        .from('user_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', g.id)
      return { ...g, member_count: count ?? 0 }
    })
  )

  return { groups }
}
