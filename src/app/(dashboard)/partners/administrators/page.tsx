import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/queries/profile'
import { getPartnerUsers } from '@/lib/queries/partner-users'
import { canViewPartnerUserDirectory } from '@/lib/permissions'
import { PartnerUsersTable } from '@/components/partners/partner-users-table'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'

export default async function PartnerAdministratorsPage() {
  const profile = await getCurrentProfile()
  if (!profile || !canViewPartnerUserDirectory(profile.role)) {
    redirect('/partners')
  }

  const administrators = await getPartnerUsers(profile, 'administrator')

  return (
    <>
      <PageHeader
        title="Partner Administrators"
        subtitle={
          profile.role === 'partner'
            ? 'Administrators in your partner organization'
            : 'Administrators across all partner organizations'
        }
      />

      <MetricCard
        label="Total Administrators"
        value={administrators.length}
        accent="primary"
        className="max-w-xs"
      />

      <PartnerUsersTable
        users={administrators}
        showOrganization={profile.role !== 'partner'}
      />
    </>
  )
}
