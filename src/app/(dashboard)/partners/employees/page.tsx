import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/queries/profile'
import { getPartnerUsers } from '@/lib/queries/partner-users'
import { getTimeOffRequests } from '@/lib/queries/time-off'
import {
  canManageTimeOff,
  canSubmitTimeOff,
  canViewPartnerUserDirectory,
} from '@/lib/permissions'
import { PartnerUsersTable } from '@/components/partners/partner-users-table'
import { TimeOffRequestForm } from '@/components/partners/time-off-request-form'
import { TimeOffRequestsPanel } from '@/components/partners/time-off-requests-panel'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'

export default async function PartnerEmployeesPage() {
  const profile = await getCurrentProfile()
  if (!profile || !canViewPartnerUserDirectory(profile.role)) {
    redirect('/partners')
  }

  const employees = await getPartnerUsers(profile, 'employee')
  const showTimeOff = canSubmitTimeOff(profile)
  const timeOffRequests = showTimeOff ? await getTimeOffRequests(profile) : []

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

      {showTimeOff && (
        <section className="space-y-4">
          <TimeOffRequestForm
            employees={employees}
            showEmployeePicker={canManageTimeOff(profile.role)}
            currentUserId={profile.id}
          />
          <div>
            <h2 className="mb-3 text-sm font-semibold">Time-off requests</h2>
            <TimeOffRequestsPanel
              requests={timeOffRequests}
              canReview={canManageTimeOff(profile.role)}
              showEmployeeColumn={canManageTimeOff(profile.role)}
            />
          </div>
        </section>
      )}

      <PartnerUsersTable
        users={employees}
        showOrganization={profile.role !== 'partner'}
      />
    </>
  )
}
