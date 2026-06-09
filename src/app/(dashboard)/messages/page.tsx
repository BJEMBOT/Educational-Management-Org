import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/queries/profile'
import {
  getConversationsForUser,
  getCurrentUserPresence,
  getMessagingDirectory,
} from '@/lib/queries/messages'
import { MessagesWorkspace } from '@/components/messages/messages-workspace'
import { PageHeader } from '@/components/ui/page-header'
import type { PresenceStatus } from '@/lib/database.types'

const MESSAGE_ROLES = [
  'admin',
  'regional_manager',
  'staff',
  'teacher',
  'coach',
  'consultant',
  'developer',
  'partner',
]

export default async function MessagesPage() {
  const profile = await getCurrentProfile()
  if (!profile || !MESSAGE_ROLES.includes(profile.role)) {
    redirect('/')
  }

  let conversations: Awaited<ReturnType<typeof getConversationsForUser>> = []
  let directory: Awaited<ReturnType<typeof getMessagingDirectory>> = []
  let myPresence: Awaited<ReturnType<typeof getCurrentUserPresence>> = null
  let loadError: string | null = null

  try {
    ;[conversations, directory, myPresence] = await Promise.all([
      getConversationsForUser(profile.id),
      getMessagingDirectory(profile.id),
      getCurrentUserPresence(profile.id),
    ])
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Failed to load messages'
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Messages"
          subtitle="See who's online, set your availability, and chat with your team"
        />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Could not load messages: {loadError}. Refresh the page or try again shortly.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        subtitle="See who's online, set your availability, and chat with your team"
      />
      <MessagesWorkspace
        currentUserId={profile.id}
        initialConversations={conversations}
        directory={directory}
        myStatus={(myPresence?.status ?? 'offline') as PresenceStatus}
        myAvailable={myPresence?.available_to_chat ?? true}
      />
    </div>
  )
}
