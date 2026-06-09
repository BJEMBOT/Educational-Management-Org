import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/database.types'

export interface UserGroup {
  id: string
  name: string
  description: string | null
  created_by: string
  created_at: string
  member_count?: number
}

export interface UserGroupWithMembers extends UserGroup {
  members: Profile[]
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name')

  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  const profiles = await getAllProfiles()
  if (!query.trim()) return profiles

  const q = query.toLowerCase()
  return profiles.filter(
    (p) =>
      p.name?.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q)
  )
}

export async function getUserGroups(): Promise<UserGroup[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_groups')
    .select('*')
    .order('name')

  if (error) throw error

  return Promise.all(
    (data ?? []).map(async (group) => {
      const { count } = await supabase
        .from('user_group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id)
      return { ...(group as UserGroup), member_count: count ?? 0 }
    })
  )
}

export async function getUserGroupWithMembers(
  groupId: string
): Promise<UserGroupWithMembers | null> {
  const supabase = await createClient()
  const { data: group, error } = await supabase
    .from('user_groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (error || !group) return null

  const { data: members } = await supabase
    .from('user_group_members')
    .select('profiles(*)')
    .eq('group_id', groupId)

  const profiles = (members ?? [])
    .map((m) => {
      const raw = m.profiles as Profile | Profile[] | null
      return Array.isArray(raw) ? raw[0] : raw
    })
    .filter(Boolean) as Profile[]

  return {
    ...(group as UserGroup),
    members: profiles,
    member_count: profiles.length,
  }
}

export async function getGroupMemberIds(groupId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_group_members')
    .select('user_id')
    .eq('group_id', groupId)
  return (data ?? []).map((m) => m.user_id)
}
