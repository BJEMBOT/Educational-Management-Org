'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { getOrCreateDirectConversation } from '@/app/actions/messages'
import { PresenceDot, presenceLabel } from '@/components/messages/presence-dot'
import { Input } from '@/components/ui/input'
import { roleLabels } from '@/lib/role-labels'
import { cn } from '@/lib/utils'
import type { MessagingDirectoryEntry, UserRole } from '@/lib/database.types'
import { toast } from 'sonner'

export function TeamDirectory({
  directory,
  onStartChat,
}: {
  directory: MessagingDirectoryEntry[]
  onStartChat: (conversationId: string) => void
}) {
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return directory
    return directory.filter(
      (u) =>
        (u.name ?? '').toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    )
  }, [directory, search])

  const available = filtered.filter(
    (u) => u.status === 'online' && u.available_to_chat
  )
  const online = filtered.filter(
    (u) => u.status === 'online' && !u.available_to_chat
  )
  const away = filtered.filter((u) => u.status === 'away')
  const offline = filtered.filter((u) => u.status === 'offline')

  async function handleMessage(userId: string) {
    setLoadingId(userId)
    const result = await getOrCreateDirectConversation(userId)
    setLoadingId(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    if (result.conversationId) {
      onStartChat(result.conversationId)
    }
  }

  function renderUser(user: MessagingDirectoryEntry) {
    const label = presenceLabel(user.status, user.available_to_chat)
    const canChat = user.status === 'online' || user.status === 'away'

    return (
      <li key={user.id}>
        <button
          type="button"
          disabled={!canChat || loadingId === user.id}
          onClick={() => handleMessage(user.id)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
            canChat ? 'hover:bg-muted' : 'cursor-default opacity-60'
          )}
        >
          <PresenceDot status={user.status} availableToChat={user.available_to_chat} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{user.name ?? 'Unnamed'}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {roleLabels[user.role as UserRole] ?? user.role} · {label}
            </p>
          </div>
        </button>
      </li>
    )
  }

  return (
    <div className="flex flex-col border-t">
      <div className="px-3 py-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Team
        </p>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto px-2 pb-3">
        {available.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 px-2 text-[10px] font-medium text-emerald-700">
              Available ({available.length})
            </p>
            <ul className="space-y-0.5">{available.map(renderUser)}</ul>
          </div>
        )}
        {online.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 px-2 text-[10px] font-medium text-sky-700">
              Online ({online.length})
            </p>
            <ul className="space-y-0.5">{online.map(renderUser)}</ul>
          </div>
        )}
        {away.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 px-2 text-[10px] font-medium text-amber-700">
              Away ({away.length})
            </p>
            <ul className="space-y-0.5">{away.map(renderUser)}</ul>
          </div>
        )}
        {offline.length > 0 && (
          <div>
            <p className="mb-1 px-2 text-[10px] font-medium text-muted-foreground">
              Offline ({offline.length})
            </p>
            <ul className="space-y-0.5">{offline.map(renderUser)}</ul>
          </div>
        )}
        {filtered.length === 0 && (
          <p className="px-2 text-xs text-muted-foreground">No team members found.</p>
        )}
      </div>
    </div>
  )
}
