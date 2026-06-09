import { createClient } from '@/lib/supabase/server'
import type {
  ConversationWithMeta,
  MessageWithSender,
  MessagingDirectoryEntry,
  PresenceStatus,
  UserPresenceWithProfile,
} from '@/lib/database.types'

export async function getConversationsForUser(
  userId: string
): Promise<ConversationWithMeta[]> {
  const supabase = await createClient()

  const { data: memberships, error } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId)

  if (error) throw error
  if (!memberships?.length) return []

  const conversationIds = memberships.map((m) => m.conversation_id)
  const lastReadMap = new Map(
    memberships.map((m) => [m.conversation_id, m.last_read_at])
  )

  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .in('id', conversationIds)
    .order('updated_at', { ascending: false })

  if (convError) throw convError

  const { data: allParticipants, error: partError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id, profiles(name)')
    .in('conversation_id', conversationIds)

  if (partError) throw partError

  const participantsByConv = new Map<string, { ids: string[]; names: string[] }>()
  for (const p of allParticipants ?? []) {
    const row = p as {
      conversation_id: string
      user_id: string
      profiles: { name: string | null } | { name: string | null }[] | null
    }
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    const entry = participantsByConv.get(row.conversation_id) ?? {
      ids: [],
      names: [],
    }
    entry.ids.push(row.user_id)
    if (row.user_id !== userId) {
      entry.names.push(profile?.name ?? 'Unknown')
    }
    participantsByConv.set(row.conversation_id, entry)
  }

  const results: ConversationWithMeta[] = []

  for (const conv of conversations ?? []) {
    const { data: messages } = await supabase
      .from('messages')
      .select('id, body, created_at, sender_id')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: false })
      .limit(1)

    const lastMsg = messages?.[0]
    const lastRead = lastReadMap.get(conv.id)
    let unread_count = 0
    if (lastMsg && lastMsg.sender_id !== userId) {
      if (!lastRead || new Date(lastMsg.created_at) > new Date(lastRead)) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', userId)
          .gt('created_at', lastRead ?? '1970-01-01')
        unread_count = count ?? 0
      }
    }

    const parts = participantsByConv.get(conv.id) ?? { ids: [], names: [] }
    const displayTitle =
      conv.is_group && conv.title
        ? conv.title
        : parts.names.join(', ') || 'Direct message'

    results.push({
      ...conv,
      title: displayTitle,
      participant_names: parts.names,
      participant_ids: parts.ids,
      last_message: lastMsg?.body ?? null,
      last_message_at: lastMsg?.created_at ?? null,
      unread_count,
    })
  }

  return results
}

export async function getMessagesForConversation(
  conversationId: string
): Promise<MessageWithSender[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  if (!data?.length) return []

  const senderIds = [...new Set(data.map((m) => m.sender_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', senderIds)

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.name ?? 'Unknown']))

  return data.map((msg) => ({
    ...msg,
    sender_name: nameMap.get(msg.sender_id) ?? 'Unknown',
  }))
}

export async function getMessagingDirectory(
  currentUserId: string
): Promise<MessagingDirectoryEntry[]> {
  const supabase = await createClient()

  const [profilesRes, presenceRes] = await Promise.all([
    supabase.from('profiles').select('id, name, role').neq('id', currentUserId).order('name'),
    supabase.from('user_presence').select('user_id, status, available_to_chat, last_seen_at'),
  ])

  if (profilesRes.error) throw profilesRes.error
  if (presenceRes.error) throw presenceRes.error

  const presenceMap = new Map(
    (presenceRes.data ?? []).map((p) => [p.user_id, p])
  )

  return (profilesRes.data ?? []).map((profile) => {
    const p = presenceMap.get(profile.id)
    return {
      id: profile.id,
      name: profile.name,
      role: profile.role,
      status: (p?.status ?? 'offline') as PresenceStatus,
      available_to_chat: p?.available_to_chat ?? true,
      last_seen_at: p?.last_seen_at ?? null,
    }
  })
}

export async function getCurrentUserPresence(
  userId: string
): Promise<UserPresenceWithProfile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_presence')
    .select('*, profiles(name, role)')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const row = data as UserPresenceWithProfile & {
    profiles: { name: string | null; role: string } | { name: string | null; role: string }[] | null
  }
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
  const { profiles, ...presence } = row
  return {
    ...presence,
    name: profile?.name ?? null,
    role: profile?.role as UserPresenceWithProfile['role'],
  }
}
