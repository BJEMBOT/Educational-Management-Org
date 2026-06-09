import { Plus } from 'lucide-react'
import { getCurrentProfile } from '@/lib/queries/profile'
import { getPartners } from '@/lib/queries/partners'
import { getSchools } from '@/lib/queries/schools'
import { hasPermission } from '@/lib/permissions'
import { PartnerFormDialog } from '@/components/partners/partner-form-dialog'
import { PartnersTable } from '@/components/partners/partners-table'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'

export default async function PartnersPage() {
  const profile = await getCurrentProfile()
  const canManage =
    profile &&
    (hasPermission(profile.role, '*') ||
      profile.role === 'admin' ||
      profile.role === 'regional_manager')

  const [partners, schools] = await Promise.all([getPartners(), getSchools()])
  const consultants = partners.filter((p) => p.partner_type === 'consultant').length
  const vendors = partners.filter((p) => p.partner_type === 'vendor').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partners"
        subtitle="Consultants and vendors supporting your schools and districts"
        actions={
          canManage ? (
            <PartnerFormDialog
              schools={schools}
              trigger={
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Partner
                </>
              }
            />
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total Partners" value={partners.length} accent="primary" />
        <MetricCard label="Consultants" value={consultants} accent="default" />
        <MetricCard label="Vendors" value={vendors} accent="default" />
      </div>

      <PartnersTable partners={partners} />
    </div>
  )
}
