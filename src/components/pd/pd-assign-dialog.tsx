'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import {
  assignPdToGroup,
  assignPdToUsers,
  createUserGroup,
  getGroupsForAssignment,
  searchUsersForAssignment,
} from '@/app/actions/pd-assignment'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTriggerButton,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { roleLabels } from '@/lib/role-labels'
import type { Profile, UserRole } from '@/lib/database.types'

interface Group {
  id: string
  name: string
  description: string | null
  member_count: number
}

export function PdAssignDialog({
  eventId,
  eventTitle,
  trigger,
}: {
  eventId: string
  eventTitle: string
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<Profile[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set())
  const [newGroupName, setNewGroupName] = useState('')
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  useEffect(() => {
    if (!open) return
    searchUsersForAssignment('').then((res) => {
      if (res.users) setUsers(res.users as Profile[])
    })
    getGroupsForAssignment().then((res) => {
      if (res.groups) setGroups(res.groups as Group[])
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      searchUsersForAssignment(search).then((res) => {
        if (res.users) setUsers(res.users as Profile[])
      })
    }, 200)
    return () => clearTimeout(timer)
  }, [search, open])

  const filteredUsers = useMemo(() => users, [users])

  function toggleUser(id: string) {
    setSelectedUserIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleGroup(id: string) {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleAssign() {
    setLoading(true)
    let total = 0

    if (selectedUserIds.size > 0) {
      const result = await assignPdToUsers(eventId, [...selectedUserIds])
      if (result.error) {
        toast.error(result.error)
        setLoading(false)
        return
      }
      total += result.count ?? 0
    }

    for (const groupId of selectedGroupIds) {
      const result = await assignPdToGroup(eventId, groupId)
      if (result.error) {
        toast.error(result.error)
        setLoading(false)
        return
      }
      total += result.count ?? 0
    }

    setLoading(false)

    if (total === 0 && selectedUserIds.size === 0 && selectedGroupIds.size === 0) {
      toast.error('Select users or groups to assign.')
      return
    }

    toast.success(`Assigned ${total} user(s) to "${eventTitle}"`)
    setOpen(false)
    setSelectedUserIds(new Set())
    setSelectedGroupIds(new Set())
    router.refresh()
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return
    const result = await createUserGroup({
      name: newGroupName.trim(),
      memberIds: [...selectedUserIds],
    })
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(`Group "${newGroupName}" created`)
    setNewGroupName('')
    setShowCreateGroup(false)
    setSelectedUserIds(new Set())
    const res = await getGroupsForAssignment()
    if (res.groups) setGroups(res.groups as Group[])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTriggerButton size="sm" variant="outline">
        {trigger}
      </DialogTriggerButton>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Session</DialogTitle>
          <p className="text-sm text-muted-foreground truncate">{eventTitle}</p>
        </DialogHeader>

        <Tabs defaultValue="users" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              Users
            </TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="flex-1 overflow-hidden flex flex-col gap-3 mt-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <div className="flex-1 overflow-y-auto rounded-md border max-h-52">
              {filteredUsers.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">No users found</p>
              ) : (
                <ul className="divide-y">
                  {filteredUsers.map((user) => (
                    <li key={user.id}>
                      <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-muted/50">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.has(user.id)}
                          onChange={() => toggleUser(user.id)}
                          className="rounded border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name ?? 'Unnamed'}</p>
                          <p className="text-xs text-muted-foreground">
                            {roleLabels[user.role as UserRole] ?? user.role}
                          </p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selectedUserIds.size > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {selectedUserIds.size} selected
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowCreateGroup(!showCreateGroup)}
                >
                  <UserPlus className="mr-1 h-3 w-3" />
                  Save as group
                </Button>
              </div>
            )}
            {showCreateGroup && (
              <div className="flex gap-2">
                <Input
                  placeholder="Group name (e.g. Math Teachers)"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button type="button" size="sm" onClick={handleCreateGroup}>
                  Create
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="groups" className="flex-1 overflow-y-auto mt-3 max-h-64">
            {groups.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No groups yet. Select users and save as a group.
              </p>
            ) : (
              <ul className="space-y-2">
                {groups.map((group) => (
                  <li key={group.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 hover:bg-muted/50">
                      <input
                        type="checkbox"
                        checked={selectedGroupIds.has(group.id)}
                        onChange={() => toggleGroup(group.id)}
                        className="rounded border-border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{group.name}</p>
                        {group.description && (
                          <p className="text-xs text-muted-foreground">{group.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {group.member_count} members
                      </Badge>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>

        <Button
          className="w-full mt-2"
          onClick={handleAssign}
          disabled={loading || (selectedUserIds.size === 0 && selectedGroupIds.size === 0)}
        >
          {loading
            ? 'Assigning...'
            : `Assign${selectedUserIds.size + selectedGroupIds.size > 0 ? ` (${selectedUserIds.size} users${selectedGroupIds.size > 0 ? `, ${selectedGroupIds.size} groups` : ''})` : ''}`}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
