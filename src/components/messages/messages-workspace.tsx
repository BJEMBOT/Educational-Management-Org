'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  fetchConversationMessages,
  markConversationRead,
  sendMessage,
} from '@/app/actions/messages'
import { NewConversationDialog } from '@/components/messages/new-conversation-dialog'
import { TeamDirectory } from '@/components/messages/team-directory'
import { ChatAvailabilityToggle } from '@/components/messages/chat-availability-toggle'
import { PresenceDot, presenceLabel } from '@/components/messages/presence-dot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type {
  ConversationWithMeta,
  MessageWithSender,
  MessagingDirectoryEntry,
  PresenceStatus,
} from '@/lib/database.types'

export function MessagesWorkspace({
  currentUserId,
  initialConversations,
  directory,
  myStatus,
  myAvailable,
}: {
  currentUserId: string
  initialConversations: ConversationWithMeta[]
  directory: MessagingDirectoryEntry[]
  myStatus: PresenceStatus
  myAvailable: boolean
}) {
  const [conversations, setConversations] = useState(initialConversations)
  const [directoryState, setDirectoryState] = useState(directory)
  const [activeId, setActiveId] = useState<string | null>(
    initialConversations[0]?.id ?? null
  )
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const activeConversation = conversations.find((c) => c.id === activeId)

  const directoryMap = useMemo(
    () => new Map(directoryState.map((d) => [d.id, d])),
    [directoryState]
  )

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true)
    const result = await fetchConversationMessages(conversationId)
    setLoadingMessages(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    setMessages(result.messages ?? [])
    await markConversationRead(conversationId)
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unread_count: 0 } : c
      )
    )
  }, [])

  useEffect(() => {
    if (!activeId) return
    loadMessages(activeId)
  }, [activeId, loadMessages])

  useEffect(() => {
    if (!activeId) return
    const supabase = createClient()

    const channel = supabase
      .channel(`messages:${activeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeId}`,
        },
        async (payload) => {
          const row = payload.new as MessageWithSender

          const { data: sender } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', row.sender_id)
            .single()

          const newMsg = {
            ...row,
            sender_name: sender?.name ?? 'Unknown',
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })

          if (row.sender_id !== currentUserId) {
            markConversationRead(activeId)
          }

          setConversations((prev) =>
            prev
              .map((c) =>
                c.id === activeId
                  ? {
                      ...c,
                      last_message: row.body,
                      last_message_at: row.created_at,
                      unread_count: 0,
                    }
                  : c
              )
              .sort((a, b) => {
                const aTime = a.last_message_at ?? a.updated_at
                const bTime = b.last_message_at ?? b.updated_at
                return new Date(bTime).getTime() - new Date(aTime).getTime()
              })
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeId, currentUserId])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('presence-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_presence' },
        (payload) => {
          const row = payload.new as {
            user_id: string
            status: PresenceStatus
            available_to_chat: boolean
            last_seen_at: string
          }
          if (!row?.user_id || row.user_id === currentUserId) return

          setDirectoryState((prev) =>
            prev.map((d) =>
              d.id === row.user_id
                ? {
                    ...d,
                    status: row.status,
                    available_to_chat: row.available_to_chat,
                    last_seen_at: row.last_seen_at,
                  }
                : d
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!activeId || !draft.trim()) return
    setSending(true)
    const result = await sendMessage(activeId, draft)
    setSending(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    if (result.message) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === result.message!.id)) return prev
        return [...prev, result.message as MessageWithSender]
      })
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  last_message: result.message!.body,
                  last_message_at: result.message!.created_at,
                }
              : c
          )
          .sort((a, b) => {
            const aTime = a.last_message_at ?? a.updated_at
            const bTime = b.last_message_at ?? b.updated_at
            return new Date(bTime).getTime() - new Date(aTime).getTime()
          })
      )
    }
    setDraft('')
  }

  function handleConversationCreated(id: string) {
    setActiveId(id)
    window.location.reload()
  }

  function handleStartChat(conversationId: string) {
    setActiveId(conversationId)
    if (!conversations.some((c) => c.id === conversationId)) {
      window.location.reload()
    }
  }

  const otherParticipantId = activeConversation?.participant_ids.find(
    (id) => id !== currentUserId
  )
  const otherUser = otherParticipantId
    ? directoryMap.get(otherParticipantId)
    : undefined

  return (
    <div className="space-y-4">
      <ChatAvailabilityToggle status={myStatus} availableToChat={myAvailable} />

      <div className="flex h-[calc(100vh-16rem)] min-h-[480px] overflow-hidden rounded-lg border bg-card shadow-sm">
        <aside className="flex w-full max-w-xs flex-col border-r">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-heading text-sm font-semibold">Inbox</h2>
            <NewConversationDialog onCreated={handleConversationCreated} />
          </div>
          <ul className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                No conversations yet. Message someone from the team list below.
              </li>
            ) : (
              conversations.map((conv) => (
                <li key={conv.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(conv.id)}
                    className={cn(
                      'flex w-full flex-col gap-1 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50',
                      activeId === conv.id && 'bg-muted'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {conv.title ?? 'Conversation'}
                      </span>
                      {conv.unread_count > 0 && (
                        <Badge className="h-5 min-w-5 justify-center px-1.5 text-[10px]">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="truncate text-xs text-muted-foreground">
                        {conv.last_message}
                      </p>
                    )}
                    {conv.last_message_at && (
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.last_message_at), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
          <TeamDirectory
            directory={directoryState}
            onStartChat={handleStartChat}
          />
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          {activeConversation ? (
            <>
              <div className="flex items-center gap-2 border-b px-4 py-3">
                {otherUser && (
                  <PresenceDot
                    status={otherUser.status}
                    availableToChat={otherUser.available_to_chat}
                  />
                )}
                <div>
                  <h3 className="font-heading text-sm font-semibold">
                    {activeConversation.title ?? 'Conversation'}
                  </h3>
                  {otherUser && (
                    <p className="text-xs text-muted-foreground">
                      {presenceLabel(otherUser.status, otherUser.available_to_chat)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {loadingMessages ? (
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No messages yet. Say hello!
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_id === currentUserId
                    return (
                      <div
                        key={msg.id}
                        className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                            isMine
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          )}
                        >
                          {!isMine && (
                            <p className="mb-0.5 text-[10px] font-medium opacity-70">
                              {msg.sender_name}
                            </p>
                          )}
                          <p>{msg.body}</p>
                          <p
                            className={cn(
                              'mt-1 text-[10px]',
                              isMine
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}
                          >
                            {format(new Date(msg.created_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <form onSubmit={handleSend} className="flex gap-2 border-t p-4">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                />
                <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
              <p>Select a conversation or message someone from the team list.</p>
              <p className="text-xs">
                Green = available to chat · Blue = online · Gray = offline
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
