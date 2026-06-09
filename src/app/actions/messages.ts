'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import { getMessagesForConversation } from '@/lib/queries/messages'
import type { PresenceStatus } from '@/lib/database.types'

export async function getOrCreateDirectConversation(otherUserId: string) {
  const profile = await getCurrentProfile()
  if (!profile) return { error: 'Not authenticated' }

  if (otherUserId === profile.id) {
    return { error: 'Cannot message yourself.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_direct_conversation', {
    other_user_id: otherUserId,
  })

  if (error) return { error: error.message }

  revalidatePath('/messages')
  return { success: true, conversationId: data as string }
}

export async function createGroupConversation(data: {
  title: string
  participantIds: string[]
}) {
  const profile = await getCurrentProfile()
  if (!profile) return { error: 'Not authenticated' }

  const uniqueIds = [...new Set([profile.id, ...data.participantIds])]
  if (uniqueIds.length < 2) {
    return { error: 'Select at least one other participant.' }
  }

  const supabase = await createClient()
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert([
      {
        title: data.title.trim(),
        is_group: true,
        created_by: profile.id,
      },
    ])
    .select('id')
    .single()

  if (convError) return { error: convError.message }

  const { error: partError } = await supabase.from('conversation_participants').insert(
    uniqueIds.map((userId) => ({
      conversation_id: conversation.id,
      user_id: userId,
    }))
  )

  if (partError) return { error: partError.message }

  revalidatePath('/messages')
  return { success: true, conversationId: conversation.id }
}

export async function fetchConversationMessages(conversationId: string) {
  const profile = await getCurrentProfile()
  if (!profile) return { error: 'Not authenticated', messages: [] }

  try {
    const messages = await getMessagesForConversation(conversationId)
    return { messages }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : 'Failed to load messages',
      messages: [],
    }
  }
}

export async function sendMessage(conversationId: string, body: string) {
  const profile = await getCurrentProfile()
  if (!profile) return { error: 'Not authenticated' }

  const trimmed = body.trim()
  if (!trimmed) return { error: 'Message cannot be empty.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conversationId,
        sender_id: profile.id,
        body: trimmed,
      },
    ])
    .select('*')
    .single()

  if (error) return { error: error.message }

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  return {
    success: true,
    message: {
      ...data,
      sender_name: profile.name ?? 'You',
    },
  }
}

export async function markConversationRead(conversationId: string) {
  const profile = await getCurrentProfile()
  if (!profile) return { error: 'Not authenticated' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', profile.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePresence(status: PresenceStatus) {
  const profile = await getCurrentProfile()
  if (!profile) return { error: 'Not authenticated' }

  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: existing } = await supabase
    .from('user_presence')
    .select('available_to_chat')
    .eq('user_id', profile.id)
    .maybeSingle()

  const availableToChat =
    status === 'offline' ? false : (existing?.available_to_chat ?? true)

  const { error } = await supabase.from('user_presence').upsert(
    {
      user_id: profile.id,
      status,
      available_to_chat: availableToChat,
      last_seen_at: now,
      updated_at: now,
    },
    { onConflict: 'user_id' }
  )

  if (error) return { error: error.message }
  return { success: true }
}

export async function setChatAvailability(available: boolean) {
  const profile = await getCurrentProfile()
  if (!profile) return { error: 'Not authenticated' }

  const supabase = await createClient()
  const now = new Date().toISOString()

  const { error } = await supabase.from('user_presence').upsert(
    {
      user_id: profile.id,
      status: 'online',
      available_to_chat: available,
      last_seen_at: now,
      updated_at: now,
    },
    { onConflict: 'user_id' }
  )

  if (error) return { error: error.message }
  revalidatePath('/messages')
  return { success: true }
}

export async function searchUsersForMessaging(query: string) {
  const profile = await getCurrentProfile()
  if (!profile) return { error: 'Not authenticated', users: [] }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, role')
    .neq('id', profile.id)
    .order('name')

  if (error) return { error: error.message, users: [] }

  const q = query.trim().toLowerCase()
  const users = (data ?? []).filter((u) => {
    if (!q) return true
    return (
      (u.name ?? '').toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    )
  })

  return { users }
}
