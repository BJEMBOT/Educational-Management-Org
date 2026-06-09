import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/queries/profile'
import { getPartnerUsers } from '@/lib/queries/partner-users'
import { canViewPartnerUserDirectory } from '@/lib/permissions'
import { PartnerUsersTable } from '@/components/partners/partner-users-table'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'

export default async function PartnerEmployeesPage() {
  const profile = await getCurrentProfile()
  if (!profile || !canViewPartnerUserDirectory(profile.role)) {
    redirect('/partners')
  }

  const employees = await getPartnerUsers(profile, 'employee')

  return (
    <>
      <PageHeader
        title="Partner Employees"
        subtitle={
          profile.role === 'partner'
            ? 'Employees in your partner organization'
            : 'Employees across all partner organizations'
        }
      />

      <MetricCard
        label="Total Employees"
        value={employees.length}
        accent="primary"
        className="max-w-xs"
      />

      <PartnerUsersTable
        users={employees}
        showOrganization={profile.role !== 'partner'}
      />
    </>
  )
}
