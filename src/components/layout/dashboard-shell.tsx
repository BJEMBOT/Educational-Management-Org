import { AppSidebar, MobileNav } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { getProfileViewContext } from '@/lib/queries/profile'
import { getCertificationReminders } from '@/lib/queries/pd'
import { CertificationExpiryReminder } from '@/components/pd/certification-expiry-reminder'
import { PresenceTracker } from '@/components/messages/presence-tracker'
export async function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile, effectiveView, isDeveloperPreview } = await getProfileViewContext()

  let alertCount = 0
  let certReminders: Awaited<ReturnType<typeof getCertificationReminders>> = []
  if (profile) {
    try {
      certReminders = await getCertificationReminders(profile.id)
      alertCount = certReminders.length
    } catch {
      alertCount = 0
    }
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar view={effectiveView} />
      <div className="flex flex-1 flex-col min-w-0">
        <AppHeader
          profile={profile}
          effectiveView={effectiveView}
          isDeveloperPreview={isDeveloperPreview}
          alertCount={alertCount}
        />
        <MobileNav view={effectiveView} />
        <main className="flex-1 overflow-auto bg-background p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
      <CertificationExpiryReminder reminders={certReminders} />
      {profile && <PresenceTracker />}
    </div>
  )
}
