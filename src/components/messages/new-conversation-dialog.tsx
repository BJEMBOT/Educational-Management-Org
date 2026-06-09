'use client'

import { useEffect, useState } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { toast } from 'sonner'
import {
  createGroupConversation,
  getOrCreateDirectConversation,
  searchUsersForMessaging,
} from '@/app/actions/messages'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTriggerButton,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { roleLabels } from '@/lib/role-labels'
import type { Profile, UserRole } from '@/lib/database.types'

export function NewConversationDialog({
  onCreated,
}: {
  onCreated: (conversationId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<Profile[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [groupTitle, setGroupTitle] = useState('')

  useEffect(() => {
    if (!open) return
    searchUsersForMessaging(search).then((res) => {
      if (res.users) setUsers(res.users as Profile[])
    })
  }, [open, search])

  function toggleUser(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function startDirect(userId: string) {
    setLoading(true)
    const result = await getOrCreateDirectConversation(userId)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    if (result.conversationId) {
      toast.success('Conversation opened')
      setOpen(false)
      onCreated(result.conversationId)
    }
  }

  async function startGroup() {
    if (!groupTitle.trim()) {
      toast.error('Enter a group name.')
      return
    }
    if (selectedIds.size === 0) {
      toast.error('Select at least one participant.')
      return
    }
    setLoading(true)
    const result = await createGroupConversation({
      title: groupTitle.trim(),
      participantIds: [...selectedIds],
    })
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    if (result.conversationId) {
      toast.success('Group conversation created')
      setGroupTitle('')
      setSelectedIds(new Set())
      setOpen(false)
      onCreated(result.conversationId)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerButton size="sm">
        <MessageSquarePlus className="mr-2 h-4 w-4" />
        New Message
      </DialogTriggerButton>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start a Conversation</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="direct">
          <TabsList className="w-full">
            <TabsTrigger value="direct" className="flex-1">Direct</TabsTrigger>
            <TabsTrigger value="group" className="flex-1">Group</TabsTrigger>
          </TabsList>
          <TabsContent value="direct" className="space-y-3">
            <Input
              placeholder="Search people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ul className="max-h-64 space-y-1 overflow-y-auto">
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => startDirect(user.id)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span>{user.name ?? 'Unnamed'}</span>
                    <span className="text-xs text-muted-foreground">
                      {roleLabels[user.role as UserRole] ?? user.role}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="group" className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="group-title">Group name</Label>
              <Input
                id="group-title"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                placeholder="e.g. Metro North PLC"
              />
            </div>
            <Input
              placeholder="Search people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {users.map((user) => (
                <li key={user.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-muted">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(user.id)}
                      onChange={() => toggleUser(user.id)}
                    />
                    <span className="text-sm">{user.name ?? 'Unnamed'}</span>
                  </label>
                </li>
              ))}
            </ul>
            <Button className="w-full" onClick={startGroup} disabled={loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
