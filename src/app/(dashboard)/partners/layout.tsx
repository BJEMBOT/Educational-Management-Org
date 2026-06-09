import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/queries/profile'
import { PartnersNavTabs } from '@/components/partners/partners-nav-tabs'

export default async function PartnersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  if (profile.role === 'partner' && !profile.partner_id) {
    return (
      <div className="rounded-lg border bg-card px-6 py-12 text-center">
        <p className="font-medium">Partner account not configured</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is not linked to a partner organization. Contact an administrator.
        </p>
      </div>
    )
  }

  return (
    <>
      <PartnersNavTabs role={profile.role} />
      <div className="space-y-6">{children}</div>
    </>
  )
}
